import useLocalStorage from "../hooks/useLocalStorage";
import toast from "react-hot-toast";

export default function RestaurantProfile() {

  const [profile, setProfile] = useLocalStorage("restaurant-profile", {
    name: "",
    phone: "",
    email: "",
    gst: "",
    currency: "₹",
    timezone: "Asia/Kolkata",
    address: "",
  });

  const handleChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
};

  const save = () => {
    toast.success("Profile saved successfully!");
  };

  return (
    <div className="form-grid">

      <input
        value={profile.name}
        onChange={e => handleChange("name", e.target.value)}
        placeholder="Restaurant Name"
      />

      <input
        value={profile.phone}
        onChange={e => handleChange("phone", e.target.value)}
        placeholder="Phone Number"
      />

      <input
        value={profile.email}
        onChange={e => handleChange("email", e.target.value)}
        placeholder="Email Address"
      />

      <input
        value={profile.gst}
        onChange={e => handleChange("gst", e.target.value)}
        placeholder="GST / Tax ID"
      />

      <input
        value={profile.currency}
        onChange={e => handleChange("currency", e.target.value)}
        placeholder="Currency"
      />

      <input
        value={profile.timezone}
        onChange={e => handleChange("timezone", e.target.value)}
        placeholder="Timezone"
      />

      <textarea
        value={profile.address}
        onChange={e => handleChange("address", e.target.value)}
        placeholder="Full Address"
      />

      <button className="save-btn" onClick={save}>
        Save Changes
      </button>

    </div>
  );
}
