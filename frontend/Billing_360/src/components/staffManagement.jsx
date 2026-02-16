import React, { useState, useEffect } from "react";
import axios from "axios";
import "./staff.css";

const StaffManagement = () => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    aadhar: "",
    role: ""
  });

  const [staffList, setStaffList] = useState([]);

  const API = "http://localhost:8000/staff";

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const res = await axios.get(`${API}/get-staff`);
    setStaffList(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addStaff = async () => {
    if (!form.name || !form.phone) {
      alert("Name & Phone required");
      return;
    }

    await axios.post(`${API}/add-staff`, form);
    fetchStaff();

    setForm({
      name: "",
      address: "",
      phone: "",
      aadhar: "",
      role: ""
    });
  };

  const deleteStaff = async (id) => {
    await axios.delete(`${API}/delete-staff/${id}`);
    fetchStaff();
  };

  return (
    <div className="staff-container">
      <h2>Staff Management</h2>

      <div className="form-card">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
        <input name="aadhar" placeholder="Aadhar Card" value={form.aadhar} onChange={handleChange} />
        <input name="role" placeholder="Role" value={form.role} onChange={handleChange} />

        <button className="add-btn" onClick={addStaff}>Add Staff</button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Address</th>
              <th>Aadhar</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => (
              <tr key={staff.id}>
                <td>{staff.name}</td>
                <td>{staff.phone}</td>
                <td>{staff.role}</td>
                <td>{staff.address}</td>
                <td>{staff.aadhar}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteStaff(staff.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManagement;