/*
 * File: controllers/dangky.controller.js
 */
const pool = require('../config/db');

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Tính toán tiến độ học tập của học viên trong một khóa học
 * @param {string} ma_hoc_vien - Mã học viên
 * @param {string} ma_khoa_hoc - Mã khóa học
 * @returns {Promise<{tong_so_bai: number, so_bai_da_hoan_thanh: number}>}
 */
const calculateCourseProgress = async (ma_hoc_vien, ma_khoa_hoc) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM NOI_DUNG_KHOA_HOC WHERE ma_khoa_hoc = ?) as tong_so_bai,
      (SELECT COUNT(*) FROM KET_QUA_NOI_DUNG kq 
       JOIN NOI_DUNG_KHOA_HOC nd ON kq.id_noi_dung = nd.id 
       WHERE kq.ma_hoc_vien = ? 
       AND nd.ma_khoa_hoc = ? 
       AND kq.trang_thai = 'HOÀN THÀNH') as so_bai_da_hoan_thanh
  `;
  
  const [result] = await pool.query(sql, [ma_khoa_hoc, ma_hoc_vien, ma_khoa_hoc]);
  return result[0];
};

// ========================================
// CONTROLLER FUNCTIONS
// ========================================

// === 1. GHI DANH HỌC VIÊN (POST /api/dangky) ===
exports.registerStudentToCourse = async (req, res) => {
  try {
    const { ma_hoc_vien, ma_khoa_hoc } = req.body;

    if (!ma_hoc_vien || !ma_khoa_hoc) {
      return res.status(400).json({ error: 'Thiếu thông tin đăng ký' });
    }

    // Check: Khóa học phải có nội dung rồi mới cho đăng ký
    const sqlCheckContent = "SELECT COUNT(*) as total FROM NOI_DUNG_KHOA_HOC WHERE ma_khoa_hoc = ?";
    const [rows] = await pool.query(sqlCheckContent, [ma_khoa_hoc]);
    
    if (rows[0].total === 0) {
      return res.status(400).json({ 
        error: 'Khóa học này chưa có nội dung bài học, không thể đăng ký.' 
      });
    }

    const sql = "INSERT INTO DANG_KY (ma_hoc_vien, ma_khoa_hoc, ngay_dang_ky, ket_qua) VALUES (?, ?, ?, 'CHƯA CẬP NHẬT')";
    await pool.query(sql, [ma_hoc_vien, ma_khoa_hoc, new Date()]);
    
    res.status(201).json({ message: 'Đăng ký học viên thành công' });

  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Học viên đã đăng ký khóa này rồi' });
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// === 2. CẬP NHẬT KẾT QUẢ (PUT /api/dangky) ===
exports.updateEnrollmentResult = async (req, res) => {
  try {
    const { ma_hoc_vien, ma_khoa_hoc, ket_qua } = req.body;

    const validResults = ['ĐẠT', 'KHÔNG ĐẠT', 'CHƯA CẬP NHẬT'];
    if (!ket_qua || !validResults.includes(ket_qua)) {
      return res.status(400).json({ error: 'Kết quả không hợp lệ' });
    }

    const sql = "UPDATE DANG_KY SET ket_qua = ? WHERE ma_hoc_vien = ? AND ma_khoa_hoc = ?";
    const [result] = await pool.query(sql, [ket_qua, ma_hoc_vien, ma_khoa_hoc]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin đăng ký' });
    }
    
    res.json({ message: 'Cập nhật kết quả chứng chỉ thành công' });

  } catch (err) {
    console.error('Lỗi cập nhật kết quả:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// === 3. LẤY TẤT CẢ HỌC VIÊN CỦA KHÓA (Cho trang Chi tiết & Modal chấm công) ===
exports.getAllEnrollmentsByCourse = async (req, res) => {
  try {
    const { ma_kh } = req.params;
    // Query đơn giản: Lấy danh sách đăng ký
    const sql = `
      SELECT 
        dk.ma_hoc_vien,
        hv.ho_ten,
        dk.ket_qua,
        dk.ngay_dang_ky
      FROM DANG_KY dk
      JOIN HOC_VIEN hv ON dk.ma_hoc_vien = hv.ma_hoc_vien
      WHERE dk.ma_khoa_hoc = ? 
      AND hv.deleted_at IS NULL
    `;
    const [results] = await pool.query(sql, [ma_kh]);
    res.json(results);
  } catch (err) {
    console.error('Lỗi lấy danh sách học viên:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// === 4. LẤY HỌC VIÊN ĐỦ ĐIỀU KIỆN (Cho trang Cấp chứng chỉ) ===
exports.getEligibleStudents = async (req, res) => {
  try {
    const { ma_kh } = req.params;
    
    // Lấy danh sách tất cả học viên đăng ký
    const sql = `
      SELECT 
        dk.ma_hoc_vien,
        hv.ho_ten,
        dk.ket_qua,
        dk.ngay_dang_ky
      FROM DANG_KY dk
      JOIN HOC_VIEN hv ON dk.ma_hoc_vien = hv.ma_hoc_vien
      WHERE dk.ma_khoa_hoc = ? 
      AND hv.deleted_at IS NULL
    `;
    
    const [students] = await pool.query(sql, [ma_kh]);
    
    // Lọc học viên đã hoàn thành 100% bài học
    const studentsWithProgress = await Promise.all(
        students.map(async (student) => {
            const progress = await calculateCourseProgress(student.ma_hoc_vien, ma_kh);

            return {
                ...student,
                tong_so_bai: progress.tong_so_bai,
                so_bai_da_hoan_thanh: progress.so_bai_da_hoan_thanh
            };
        })
    );

    const eligibleStudents = studentsWithProgress.filter(student => 
        student.tong_so_bai > 0 && 
        student.tong_so_bai === student.so_bai_da_hoan_thanh
    );
    
    res.json(eligibleStudents);
    
  } catch (err) {
    console.error('Lỗi lấy danh sách đủ điều kiện:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// === 5. LẤY DANH SÁCH KHÓA HỌC CỦA MỘT HỌC VIÊN ===
// GET /api/dangky/hocvien/:ma_hv
exports.getCoursesByStudent = async (req, res) => {
  try {
    const { ma_hv } = req.params;

    // Lấy danh sách khóa học
    const sql = `
      SELECT 
        kh.ma_khoa_hoc,
        kh.ten_khoa,
        kh.thoi_gian_bat_dau,
        kh.thoi_gian_ket_thuc,
        dk.ngay_dang_ky,
        dk.ket_qua
      FROM DANG_KY dk
      JOIN KHOA_HOC kh ON dk.ma_khoa_hoc = kh.ma_khoa_hoc
      WHERE dk.ma_hoc_vien = ?
      ORDER BY dk.ngay_dang_ky DESC
    `;

    const [courses] = await pool.query(sql, [ma_hv]);
    
    // Thêm thông tin tiến độ cho mỗi khóa học
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progress = await calculateCourseProgress(ma_hv, course.ma_khoa_hoc);
        return {
          ...course,
          so_bai_da_hoan_thanh: progress.so_bai_da_hoan_thanh,
          tong_so_bai: progress.tong_so_bai
        };
      })
    );
    
    res.json(coursesWithProgress);

  } catch (err) {
    console.error('Lỗi lấy lịch sử học tập:', err);
    res.status(500).json({ error: 'Lỗi server: ' + err.message });
  }
};