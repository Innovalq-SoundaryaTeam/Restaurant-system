import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Table, Form, Modal, InputGroup } from 'react-bootstrap';
import '../styles/Attendance.css';
import logo from '../assets/logo360.jpeg';

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
        const strokeDasharray = `${(total === 0 ? 0 : (value / total) * circumference)} ${circumference}`;
        const strokeDashoffset = -offset;
        offset += (total === 0 ? 0 : (value / total) * circumference);
        return (
          <circle key={index} r={radius} cx={size / 2} cy={size / 2} fill="transparent" stroke={colors[index]} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
        );
      })}
      <text x="50%" y="50%" dy=".3em" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="bold">{total}</text>
    </svg>
  );
};

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & User State
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [markedToday, setMarkedToday] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  
  const [leaveRequest, setLeaveRequest] = useState({ date: '', reason: 'Sick Leave' });
  const [adminEntry, setAdminEntry] = useState({ name: '', date: '', time: '', status: 'Present' });
  const [currentEditRecord, setCurrentEditRecord] = useState(null);

  // --- 1. FETCH DATA ---
  const fetchAttendance = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/attendance/');
      setAttendanceData(response.data);
    } catch (error) {
      console.error("Error connecting to backend:", error);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // --- 2. HANDLERS ---
  const handleUserAttendance = async (action) => {
    if (markedToday) return;
    const now = new Date();
    const dateString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let finalStatus = action;
    if (action === 'Present') {
      const workStart = new Date();
      workStart.setHours(9, 30, 0);
      if (now > workStart) finalStatus = 'Late Present';
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/attendance/', { name: 'You (Current User)', status: finalStatus, date_time: dateString });
      fetchAttendance();
      setMarkedToday(true);
      setUserStatus(finalStatus);
    } catch (error) { alert("Failed to save to database!"); }
  };

  const handleAdminSubmit = async () => {
    if (!adminEntry.name) return;
    try {
      await axios.post('http://127.0.0.1:8000/api/attendance/', { name: adminEntry.name, status: adminEntry.status, date_time: `${adminEntry.date} ${adminEntry.time}` });
      fetchAttendance();
      setAdminEntry({ name: '', date: '', time: '', status: 'Present' });
    } catch (error) { alert("Error adding record"); }
  };

  const handleLeaveSubmit = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/attendance/', { name: 'You (Current User)', status: 'On Leave', date_time: `${leaveRequest.date} (${leaveRequest.reason})` });
      fetchAttendance();
      setMarkedToday(true);
      setUserStatus('On Leave');
      setShowLeaveModal(false);
    } catch (error) { alert("Error requesting leave"); }
  };

  const handleBioScan = () => {
    setShowBiometricModal(true);
    setTimeout(async () => {
      const now = new Date();
      const dateString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      try {
        await axios.post('http://127.0.0.1:8000/api/attendance/', { name: "Bio-Authenticated Staff", status: "Present", date_time: dateString });
        fetchAttendance();
        setShowBiometricModal(false);
        alert("Fingerprint recognized!");
      } catch (error) { setShowBiometricModal(false); alert("Biometric already registered!"); }
    }, 2000);
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/attendance/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Attendance_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) { alert("Export failed! Make sure you ran 'pip install pandas xlsxwriter'"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try { await axios.delete(`http://127.0.0.1:8000/api/attendance/${id}`); fetchAttendance(); }
      catch (error) { alert("Error deleting record"); }
    }
  };

  const handleUpdateSubmit = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/attendance/${currentEditRecord.id}`, currentEditRecord);
      setShowEditModal(false);
      fetchAttendance();
    } catch (error) { alert("Update failed"); }
  };

  const getStats = () => {
    const present = attendanceData.filter(d => d.status === 'Present').length;
    const late = attendanceData.filter(d => d.status === 'Late Present').length;
    const absent = attendanceData.filter(d => d.status === 'Absent').length;
    const leave = attendanceData.filter(d => d.status === 'On Leave').length;
    return [present, late, absent, leave];
  };

  const filteredData = attendanceData.filter(staff => staff.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="att-dark-wrapper">
      <div className="att-main-content">
        <Container fluid className="py-3">
          {/* Header */}
          <Row className="mb-5 align-items-center">
            <Col>
              <h2 className="mb-1 att-header-title">Staff Attendance</h2>
              <p className="att-text-muted m-0">Live Database Dashboard</p>
            </Col>
            <Col xs="auto" className="att-header-actions">
              <img src={logo} alt="Profile" className="att-profile-img" />
            </Col>
          </Row>

          {/* Stats Cards */}
          <Row className="g-4 mb-5">
            <Col lg={3} md={6}>
              <Card className="att-dark-card h-100">
                <Card.Body>
                  <p className="att-text-muted mb-2">Total Staff</p>
                  <h3>{attendanceData.length}</h3>
                  <div className="att-divider"></div>
                  <p className="att-text-muted mb-0 small">Live Database Count</p>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={5} md={12}>
              <Card className="att-dark-card h-100">
                <Card.Body className="att-chart-container">
                  <DonutChart data={getStats()} />
                  <ul className="att-legend">
                    <li><span className="att-dot" style={{ background: '#4aa773' }}></span> Present</li>
                    <li><span className="att-dot" style={{ background: '#ffc107' }}></span> Late</li>
                    <li><span className="att-dot" style={{ background: '#d64545' }}></span> Absent</li>
                    <li><span className="att-dot" style={{ background: '#0dcaf0' }}></span> Leave</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} md={6}>
              <div className="d-flex flex-column gap-3 h-100">
                <Card className="att-dark-card att-action-card flex-fill d-flex align-items-center justify-content-center p-3" onClick={handleExport}>
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-file-earmark-spreadsheet-fill fs-2 att-icon-green"></i>
                    <h6 className="m-0 att-text-muted">Export Report</h6>
                  </div>
                </Card>
                <Card className="att-dark-card att-action-card flex-fill d-flex align-items-center justify-content-center p-3" onClick={handleBioScan}>
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-fingerprint fs-2 att-icon-gold"></i>
                    <h6 className="m-0 att-text-muted">Bio-Scan</h6>
                  </div>
                </Card>
              </div>
            </Col>
          </Row>

          {/* Mark Attendance Section */}
          <div className="att-dark-card p-4 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <h3 className="mb-0 att-section-title">Mark Your Attendance</h3>
            <div className="d-flex gap-3 flex-wrap justify-content-center">
              {!markedToday ? (
                <>
                  <Button className="att-btn-purple" onClick={() => setShowLeaveModal(true)}>Request Leave</Button>
                  <Button className="att-btn-red" onClick={() => handleUserAttendance('Absent')}>Absent</Button>
                  <Button className="att-btn-green" onClick={() => handleUserAttendance('Present')}>Mark Present</Button>
                </>
              ) : (
                <div className="px-4 py-3 rounded-pill att-status-pill fw-bold">Status: {userStatus}</div>
              )}
            </div>
          </div>

          {/* Admin Entry */}
          <Card className="att-dark-card border-0 p-4 mb-5">
            <h5 className="mb-4 att-section-title">Admin Manual Entry</h5>
            <Row className="g-3 align-items-end">
              <Col md={3}><Form.Control className="att-input-white" placeholder="Name..." value={adminEntry.name} onChange={(e) => setAdminEntry({ ...adminEntry, name: e.target.value })} /></Col>
              <Col md={2}><Form.Control className="att-input-white" type="date" value={adminEntry.date} onChange={(e) => setAdminEntry({ ...adminEntry, date: e.target.value })} /></Col>
              <Col md={2}><Form.Control className="att-input-white" type="time" value={adminEntry.time} onChange={(e) => setAdminEntry({ ...adminEntry, time: e.target.value })} /></Col>
              <Col md={2}><Form.Select className="att-input-white" value={adminEntry.status} onChange={(e) => setAdminEntry({ ...adminEntry, status: e.target.value })}><option>Present</option><option>Late Present</option><option>Absent</option></Form.Select></Col>
              <Col md={3}><Button className="att-btn-green w-100" onClick={handleAdminSubmit}>Add Record</Button></Col>
            </Row>
          </Card>

          {/* Table */}
          <Card className="att-dark-card border-0 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="m-0 att-section-title">Staffs List</h4>
              <InputGroup className="att-search-group w-auto">
                <InputGroup.Text className="att-search-icon"><i className="bi bi-search"></i></InputGroup.Text>
                <Form.Control className="att-search-input" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </InputGroup>
            </div>
            <Table responsive className="att-dark-table align-middle">
              <thead>
                <tr>
                  <th>Staff Name</th><th>Status</th><th>Date & Time</th><th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(staff => (
                  <tr key={staff.id}>
                    <td><span className="fw-semibold">{staff.name}</span></td>
                    <td><span className={`att-badge-${staff.status.toLowerCase().replace(' ', '-')}`}>{staff.status}</span></td>
                    <td className="att-text-muted">{staff.date_time}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Button variant="outline-warning" size="sm" className="att-btn-icon" onClick={() => {setCurrentEditRecord(staff); setShowEditModal(true);}}><i className="bi bi-pencil-square"></i></Button>
                        <Button variant="outline-danger" size="sm" className="att-btn-icon" onClick={() => handleDelete(staff.id)}><i className="bi bi-trash3"></i></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Container>
      </div>

      {/* Modals */}
      <Modal show={showLeaveModal} onHide={() => setShowLeaveModal(false)} centered contentClassName="att-modal-content">
        <Modal.Header closeButton closeVariant="white"><Modal.Title>Request Leave</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Select Date</Form.Label><Form.Control type="date" className="att-input-white" onChange={(e) => setLeaveRequest({ ...leaveRequest, date: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Reason</Form.Label><Form.Select className="att-input-white" onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}><option value="Sick Leave">Sick Leave</option><option value="Casual Leave">Casual Leave</option><option value="Vacation">Vacation</option></Form.Select></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowLeaveModal(false)}>Cancel</Button><Button className="att-btn-purple" onClick={handleLeaveSubmit}>Submit Request</Button></Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered contentClassName="att-modal-content">
        <Modal.Header closeButton closeVariant="white"><Modal.Title>Edit Staff Record</Modal.Title></Modal.Header>
        <Modal.Body>
          {currentEditRecord && (
            <Form>
              <Form.Group className="mb-3"><Form.Label>Staff Name</Form.Label><Form.Control className="att-input-white" value={currentEditRecord.name} onChange={(e) => setCurrentEditRecord({ ...currentEditRecord, name: e.target.value })} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Select className="att-input-white" value={currentEditRecord.status} onChange={(e) => setCurrentEditRecord({ ...currentEditRecord, status: e.target.value })}><option>Present</option><option>Late Present</option><option>Absent</option><option>On Leave</option></Form.Select></Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button><Button className="att-btn-green" onClick={handleUpdateSubmit}>Update Details</Button></Modal.Footer>
      </Modal>
    </div>
  );
};

export default Attendance;