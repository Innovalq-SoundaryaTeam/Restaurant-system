import React, { useState, useEffect } from 'react';
import axios from 'axios'; // IMPORT AXIOS
import { Container, Row, Col, Card, Button, Table, Form, Modal, InputGroup } from 'react-bootstrap';
import '../styles/Attendance.css';
import logo from '../assets/logo360.jpeg';

// ... (Keep your DonutChart component exactly as it was) ...
const DonutChart = ({ data }) => {
  const size = 150;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const colors = ['#4aa773', '#ffc107', '#d64545', '#0dcaf0'];
  const total = data.reduce((acc, val) => acc + val, 0);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((value, index) => {
        const strokeDasharray = `${(value / total) * circumference} ${circumference}`;
        const strokeDashoffset = -offset;
        offset += (value / total) * circumference;
        return (
          <circle key={index} r={radius} cx={size / 2} cy={size / 2} fill="transparent" stroke={colors[index]} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
        );
      })}
      <text x="50%" y="50%" dy=".3em" textAnchor="middle" fill="var(--text-primary)" fontSize="24" fontWeight="bold">{total}</text>
    </svg>
  );
};

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]); // Start empty, fetch later
  const [theme, setTheme] = useState('light');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & User State
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [markedToday, setMarkedToday] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [leaveRequest, setLeaveRequest] = useState({ date: '', reason: 'Sick Leave' });
  const [adminEntry, setAdminEntry] = useState({ name: '', date: '', time: '', status: 'Present' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditRecord, setCurrentEditRecord] = useState(null);

  // --- 1. FETCH DATA FROM PYTHON BACKEND ---
  const fetchAttendance = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/attendance/');
      setAttendanceData(response.data);
    } catch (error) {
      console.error("Error connecting to backend:", error);
    }
  };

  useEffect(() => {
    fetchAttendance(); // Load data when page opens
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // --- 2. SEND DATA TO BACKEND (Mark Attendance) ---
  const handleUserAttendance = async (action) => {
    if (markedToday) return;

    const now = new Date();
    const dateString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Late Logic
    let finalStatus = action;
    if (action === 'Present') {
      const workStart = new Date();
      workStart.setHours(9, 30, 0);
      if (now > workStart) finalStatus = 'Late Present';
    }

    const payload = {
      name: 'You (Current User)',
      status: finalStatus,
      date_time: dateString  // Changed from 'date' to 'date_time'
    };

    try {
      await axios.post('http://127.0.0.1:8000/api/attendance/', payload);
      fetchAttendance();
      setMarkedToday(true);
      setUserStatus(finalStatus);
    } catch (error) {
      alert("Failed to save to database!");
    }
  };

  // --- 3. ADMIN ADD RECORD ---
  const handleAdminSubmit = async () => {
    if (!adminEntry.name) return;

    const payload = {
      name: adminEntry.name,
      status: adminEntry.status,
      date_time: `${adminEntry.date} ${adminEntry.time}`
    };

    try {
      await axios.post('http://127.0.0.1:8000/api/attendance/', payload);
      fetchAttendance(); // Refresh list
      setAdminEntry({ name: '', date: '', time: '', status: 'Present' });
    } catch (error) {
      alert("Error adding record");
    }
  };

  // --- Leave Logic (Simplified for now) ---
  const handleLeaveSubmit = async () => {
    const payload = {
      name: 'You (Current User)',
      status: 'On Leave',
      date_time: `${leaveRequest.date} (${leaveRequest.reason})` // Changed from 'date' to 'date_time'
    };
    try {
      await axios.post('http://127.0.0.1:8000/api/attendance/', payload);
      fetchAttendance();
      setMarkedToday(true);
      setUserStatus('On Leave');
      setShowLeaveModal(false);
    } catch (error) {
      alert("Error requesting leave");
    }
  };

  const handleBioScan = () => {
    setShowBiometricModal(true);
    setTimeout(async () => {
      const now = new Date();
      const dateString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const payload = {
        name: "Bio-Authenticated Staff",
        status: "Present",
        date_time: dateString // Use date_time here
      };

      try {
        await axios.post('http://127.0.0.1:8000/api/attendance/', payload);
        fetchAttendance();
        setShowBiometricModal(false);
        alert("Fingerprint recognized!");
      } catch (error) {
        setShowBiometricModal(false);
        alert("Biometric already registered!");
      }
    }, 2000);
  };
  const handleExport = async () => {
    try {
      // 1. Get the file from the backend as a 'blob'
      const response = await axios.get('http://127.0.0.1:8000/api/attendance/export', {
        responseType: 'blob', // Important!
      });

      // 2. Create a hidden link in the browser
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // 3. Tell the link to download the file
      link.setAttribute('download', 'Attendance_Report.xlsx');
      document.body.appendChild(link);

      // 4. "Click" the link automatically
      link.click();

      link.remove();
    } catch (error) {
      alert("Export failed! Make sure you ran 'pip install pandas xlsxwriter'");
    }
  };

  // --- Helper: Count stats ---
  const getStats = () => {
    if (!attendanceData) return [0, 0, 0, 0];
    const present = attendanceData.filter(d => d.status === 'Present').length;
    const late = attendanceData.filter(d => d.status === 'Late Present').length;
    const absent = attendanceData.filter(d => d.status === 'Absent').length;
    const leave = attendanceData.filter(d => d.status === 'On Leave').length;
    return [present, late, absent, leave];
  };

  const filteredData = attendanceData.filter(staff => staff.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // 1. DELETE FUNCTION
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/attendance/${id}`);
        fetchAttendance(); // Refresh list
      } catch (error) {
        alert("Error deleting record");
      }
    }
  };

  // 2. OPEN EDIT MODAL
  const handleEditClick = (record) => {
    setCurrentEditRecord(record);
    setShowEditModal(true);
  };

  // 3. SUBMIT UPDATE
  const handleUpdateSubmit = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/attendance/${currentEditRecord.id}`, currentEditRecord);
      setShowEditModal(false);
      fetchAttendance();
    } catch (error) {
      alert("Update failed");
    }
  };

  // ... (Your Return JSX remains mostly the same, just ensure it uses filteredData) ...
  return (
    <div className="app-wrapper">
      {/* Paste the rest of your original JSX return here (Main Content, Modals, etc.) */}
      {/* Since the structure is identical, you can keep your existing UI code. */}
      {/* Just make sure to use the functions defined above. */}
      <div className="main-content-area">
        <Container fluid className="py-3">
          {/* Header */}
          <Row className="mb-5 align-items-center">
            <Col>
              <h2 className="mb-1">Staff Attendance</h2>
              <p className="text-muted-luxury m-0">Live Database Dashboard</p>
            </Col>
            <Col xs="auto" className="header-actions">
              <Form.Check type="switch" id="custom-switch" className="luxury-switch" checked={theme === 'dark'} onChange={toggleTheme} />
              <img src={logo} alt="Profile" className="user-profile-hd" />
            </Col>
          </Row>

          {/* Stats & Charts */}
          <Row className="g-4 mb-5">
            {/* Total Records Card */}
            <Col lg={3} md={6}>
              <Card className="glass-panel info-card h-100">
                <Card.Body>
                  <p className="text-muted-luxury mb-2">Total Staff</p>
                  <h3>{attendanceData.length}</h3>
                  <div className="luxury-divider"></div>
                  <p className="text-muted-luxury mb-0 small">Live Database Count</p>
                </Card.Body>
              </Card>
            </Col>

            {/* Analytics Chart */}
            <Col lg={5} md={12}>
              <Card className="glass-panel info-card h-100">
                <Card.Body className="analytics-container">
                  <DonutChart data={getStats()} />
                  <ul className="chart-legend">
                    <li><span className="legend-dot" style={{ background: '#4aa773' }}></span> Present</li>
                    <li><span className="legend-dot" style={{ background: '#ffc107' }}></span> Late</li>
                    <li><span className="legend-dot" style={{ background: '#d64545' }}></span> Absent</li>
                    <li><span className="legend-dot" style={{ background: '#0dcaf0' }}></span> Leave</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            {/* NEW: Export & Bio-Scan Cards */}
            <Col lg={4} md={6}>
              <div className="d-flex flex-column gap-3 h-100">
                <Card className="glass-panel action-card-luxury flex-fill d-flex align-items-center justify-content-center p-3" onClick={handleExport} style={{ cursor: 'pointer' }}>
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-file-earmark-spreadsheet-fill fs-2 xls-icon" style={{ color: '#1d6f42' }}></i>
                    <h6 className="m-0 text-muted-luxury">Export Report</h6>
                  </div>
                </Card>

                <Card className="glass-panel action-card-luxury flex-fill d-flex align-items-center justify-content-center p-3"
                  onClick={handleBioScan} // Make sure this is linked!
                  style={{ cursor: 'pointer' }}>
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-fingerprint fs-2 bio-icon" style={{ color: '#a370f7' }}></i>
                    <h6 className="m-0 text-muted-luxury">Bio-Scan</h6>
                  </div>
                </Card>
              </div>
            </Col>
          </Row>

          {/* Mark Attendance */}
          <div className="mark-attendance-container glass-panel p-4 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div><h3 className="mb-1">Mark Your Attendance</h3></div>
            <div className="d-flex gap-3 flex-wrap justify-content-center">
              {!markedToday ? (
                <>
                  <Button className="btn-luxury-purple" onClick={() => setShowLeaveModal(true)}>Request Leave</Button>
                  <Button className="btn-luxury-red" onClick={() => handleUserAttendance('Absent')}>Absent</Button>
                  <Button className="btn-luxury-green" onClick={() => handleUserAttendance('Present')}>Mark Present</Button>
                </>
              ) : (
                <div className={`px-4 py-3 rounded-pill glass-panel border-0 fw-bold`}>Status: {userStatus}</div>
              )}
            </div>
          </div>

          {/* Admin Entry */}
          <Card className="glass-panel border-0 p-4 mb-5">
            <h5 className="mb-4">Admin Manual Entry</h5>
            <Row className="g-3 align-items-end">
              <Col md={3}><Form.Control placeholder="Name..." value={adminEntry.name} onChange={(e) => setAdminEntry({ ...adminEntry, name: e.target.value })} /></Col>
              <Col md={2}><Form.Control type="date" value={adminEntry.date} onChange={(e) => setAdminEntry({ ...adminEntry, date: e.target.value })} /></Col>
              <Col md={2}><Form.Control type="time" value={adminEntry.time} onChange={(e) => setAdminEntry({ ...adminEntry, time: e.target.value })} /></Col>
              <Col md={2}><Form.Select value={adminEntry.status} onChange={(e) => setAdminEntry({ ...adminEntry, status: e.target.value })}><option>Present</option><option>Late Present</option><option>Absent</option></Form.Select></Col>
              <Col md={3}><Button className="btn-luxury-green w-100" onClick={handleAdminSubmit}>Add Record</Button></Col>
            </Row>
          </Card>

          {/* Table */}
          <Card className="glass-panel border-0 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="m-0">Staffs List</h4>
              <InputGroup className="luxury-input-group w-auto">
                <InputGroup.Text><i className="bi bi-search text-muted-luxury"></i></InputGroup.Text>
                <Form.Control placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </InputGroup>
            </div>
            <Table responsive className="luxury-table align-middle">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Staff Name</th>
                  <th style={{ width: '20%' }}>Status</th>
                  <th style={{ width: '35%' }}>Date & Time</th>
                  <th className="text-end" style={{ width: '20%' }}>Action</th> {/* Add this header */}
                </tr>
              </thead>
              <tbody>
                {filteredData.map(staff => (
                  <tr key={staff.id}>
                    <td><span className="fw-semibold">{staff.name}</span></td>
                    <td>
                      <span className={
                        staff.status === 'Present' ? 'status-badge-present' :
                          staff.status === 'Late Present' ? 'status-badge-late' :
                            staff.status === 'On Leave' ? 'status-badge-leave' : 'status-badge-absent'
                      }>
                        {staff.status}
                      </span>
                    </td>
                    <td className="text-muted-luxury">{staff.date_time}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        {/* EDIT BUTTON (Gold/Amber) */}
                        <Button variant="outline-warning" size="sm" className="btn-action-edit" onClick={() => handleEditClick(staff)}>
                          <i className="bi bi-pencil-square"></i>
                        </Button>

                        {/* DELETE BUTTON (Red) */}
                        <Button variant="outline-danger" size="sm" className="btn-action-delete" onClick={() => handleDelete(staff.id)}>
                          <i className="bi bi-trash3"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

        </Container>
      </div>
      {/* --- Leave Request Modal --- */}
      <Modal show={showLeaveModal} onHide={() => setShowLeaveModal(false)} centered contentClassName="luxury-modal-content">
        <Modal.Header closeButton><Modal.Title>Request Leave</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Date</Form.Label>
              <Form.Control
                type="date"
                className="luxury-input-group"
                onChange={(e) => setLeaveRequest({ ...leaveRequest, date: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Select
                className="luxury-input-group luxury-select"
                onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
              >
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Vacation">Vacation</option>
                <option value="Emergency">Emergency</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowLeaveModal(false)}>Cancel</Button>
          {/* MAKE SURE onClick={handleLeaveSubmit} IS HERE */}
          <Button className="btn-luxury-purple" onClick={handleLeaveSubmit}>Submit Request</Button>
        </Modal.Footer>
      </Modal>
      {/* --- Edit Record Modal --- */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered contentClassName="luxury-modal-content">
        <Modal.Header closeButton><Modal.Title>Edit Staff Record</Modal.Title></Modal.Header>
        <Modal.Body>
          {currentEditRecord && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Staff Name</Form.Label>
                <Form.Control
                  value={currentEditRecord.name}
                  onChange={(e) => setCurrentEditRecord({ ...currentEditRecord, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={currentEditRecord.status}
                  onChange={(e) => setCurrentEditRecord({ ...currentEditRecord, status: e.target.value })}
                >
                  <option>Present</option>
                  <option>Late Present</option>
                  <option>Absent</option>
                  <option>On Leave</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button className="btn-luxury-green" onClick={handleUpdateSubmit}>Update Details</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Attendance;