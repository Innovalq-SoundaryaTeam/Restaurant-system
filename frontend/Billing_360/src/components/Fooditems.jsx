import { useState, useEffect, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import "../styles/FoodItems.css";

const API_URL = "http://localhost:8000/api/menu";

export default function FoodItems() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    image: "",
  });
  

  const pageSize = 10;

  const handleImageUpload = (file) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    setForm((prev) => ({
      ...prev,
      image: reader.result, // base64 string
    }));
  };
  reader.readAsDataURL(file);
};


  /* ================= FETCH ITEMS ================= */
  const fetchItems = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      toast.error("Failed to load items");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ================= MODAL ================= */
  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", category: "", price: "", image: "" });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setModalOpen(true);
  };

  /* ================= SAVE ================= */
  const saveItem = async () => {
    if (!form.name || !form.category || !form.price) {
      toast.error("All fields are required");
      return;
    }

    try {
      const res = await fetch(
        editItem ? `${API_URL}/${editItem.id}` : API_URL,
        {
          method: editItem ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
          }),
        }
      );

      if (!res.ok) throw new Error();

      toast.success(editItem ? "Item updated" : "Item added");
      setModalOpen(false);
      fetchItems();
      } catch {
      toast.error("Something went wrong");
      }
  };

  /* ================= DELETE ================= */
  const deleteItem = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Item deleted");
      fetchItems();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="food-page">
      {/* HEADER */}
      <div className="food-header">
        <div className="title-wrap">
          <h2>Food Items</h2>
          <button className="add-btn" onClick={openAdd}>
            Add New
          </button>
        </div>

        <div className="search-box">
          <FaSearch />
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>IMAGE</th>
              <th>NAME</th>
              <th>CATEGORY</th>
              <th>PRICE</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      style={{
                        width: 50,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>${item.price}</td>
                <td>
                  <button
                    className="icon-btn edit"
                    onClick={() => openEdit(item)}
                  >
                    ✏️
                  </button>
                  <button
                    className="icon-btn delete"
                    onClick={() => deleteItem(item.id)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* FOOTER */}
        <div className="table-footer">
          <span>
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, filtered.length)} of{" "}
            {filtered.length}
          </span>

          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span className="page">{page}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{editItem ? "Edit Item" : "Add Item"}</h3>

            <input
              placeholder="Item Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <input
              type="file"
              accept="image/*"
               onChange={(e) => handleImageUpload(e.target.files[0])}
            />

            {form.image && (
              <img
                src={form.image}
                alt="preview"
                style={{ width: "100%", marginTop: 10, borderRadius: 8 }}
              />
            )}

            <div className="modal-actions">
              <button className="cancel" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="save" onClick={saveItem}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
