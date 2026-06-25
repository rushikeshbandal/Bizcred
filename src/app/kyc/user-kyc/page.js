"use client";

import { useRef, useState } from "react";
import UserSidebar from
"@/components/user-components/UserSidebar";
export default function KYCPage() {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({

    pan: "",
    aadhaar: "",

    bankAccount: "",
    ifsc: "",
    accountHolder: "",

  });

  const [panImage, setPanImage] = useState(null);
  const [aadhaarImage, setAadhaarImage] = useState(null);

  const [selfie, setSelfie] = useState(null);

  const [loading, setLoading] = useState(false);

  // HANDLE TEXT INPUTS

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  // OPEN CAMERA

  const startCamera = async () => {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    videoRef.current.srcObject = stream;

  };

  // CAPTURE SELFIE

  const captureSelfie = () => {

    const canvas = canvasRef.current;

    const video = videoRef.current;

    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/png");

    setSelfie(imageData);

    // STOP CAMERA

    const stream = video.srcObject;

    const tracks = stream.getTracks();

    tracks.forEach((track) => track.stop());

  };

  // SUBMIT KYC

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const res = await fetch("/api/kyc", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          userId: localStorage.getItem("userId"),

          pan: formData.pan,
          aadhaar: formData.aadhaar,

          bankAccount: formData.bankAccount,
          ifsc: formData.ifsc,
          accountHolder: formData.accountHolder,

          panImage,
          aadhaarImage,

          selfie,

        }),

      });

      const data = await res.json();

      alert(data.message);

    } catch (error) {

      console.log(error);

      alert("Something went wrong");

    }

    setLoading(false);

  };

  return (

    <div style={container}>
<UserSidebar />
      <div style={card}>

        <h1 style={title}>
          KYC Verification
        </h1>

        <form onSubmit={handleSubmit} style={form}>

          {/* PAN */}

          <label style={label}>PAN Number</label>

          <input
            type="text"
            name="pan"
            placeholder="Enter PAN Number"
            onChange={handleChange}
            style={input}
            required
          />

          {/* PAN UPLOAD */}

          <label style={label}>Upload PAN Card</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {

              const file = e.target.files[0];

              const reader = new FileReader();

              reader.onloadend = () => {
                setPanImage(reader.result);
              };

              if (file) {
                reader.readAsDataURL(file);
              }

            }}
          />

          {/* AADHAAR */}

          <label style={label}>Aadhaar Number</label>

          <input
            type="text"
            name="aadhaar"
            placeholder="Enter Aadhaar Number"
            onChange={handleChange}
            style={input}
            required
          />

          {/* AADHAAR UPLOAD */}

          <label style={label}>Upload Aadhaar Card</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {

              const file = e.target.files[0];

              const reader = new FileReader();

              reader.onloadend = () => {
                setAadhaarImage(reader.result);
              };

              if (file) {
                reader.readAsDataURL(file);
              }

            }}
          />

          {/* BANK DETAILS */}

          <label style={label}>Bank Account Number</label>

          <input
            type="text"
            name="bankAccount"
            placeholder="Enter Bank Account Number"
            onChange={handleChange}
            style={input}
            required
          />

          <label style={label}>IFSC Code</label>

          <input
            type="text"
            name="ifsc"
            placeholder="Enter IFSC Code"
            onChange={handleChange}
            style={input}
            required
          />

          <label style={label}>Account Holder Name</label>

          <input
            type="text"
            name="accountHolder"
            placeholder="Enter Account Holder Name"
            onChange={handleChange}
            style={input}
            required
          />

          {/* SELFIE */}

          <label style={label}>Live Selfie Verification</label>

          <button
            type="button"
            onClick={startCamera}
            style={cameraBtn}
          >
            Open Camera
          </button>

          <video
            ref={videoRef}
            autoPlay
            style={video}
          />

          <button
            type="button"
            onClick={captureSelfie}
            style={captureBtn}
          >
            Capture Selfie
          </button>

          <canvas
            ref={canvasRef}
            style={{ display: "none" }}
          />

          {selfie && (
            <img
              src={selfie}
              alt="Selfie"
              style={preview}
            />
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            style={submitBtn}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit KYC"}
          </button>

        </form>

      </div>

    </div>

  );
}

//
// STYLES
//

const container = {

  minHeight: "100vh",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  background: "#f4f7fb",

  padding: "20px",

};

const card = {

  width: "100%",

  maxWidth: "550px",

  background: "#fff",

  padding: "30px",

  borderRadius: "12px",

  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",

};

const title = {

  textAlign: "center",

  marginBottom: "25px",

  paddingTop: "20px",

};

const form = {

  display: "flex",

  flexDirection: "column",

  gap: "15px",

};

const label = {

  fontWeight: "600",

};

const input = {

  padding: "12px",

  border: "1px solid #ccc",

  borderRadius: "6px",

};

const video = {

  width: "100%",

  borderRadius: "10px",

};

const preview = {

  width: "100%",

  borderRadius: "10px",

};

const cameraBtn = {

  padding: "12px",

  background: "#111827",

  color: "#fff",

  border: "none",

  borderRadius: "6px",

  cursor: "pointer",

};

const captureBtn = {

  padding: "12px",

  background: "#16a34a",

  color: "#fff",

  border: "none",

  borderRadius: "6px",

  cursor: "pointer",

};

const submitBtn = {

  padding: "14px",

  background: "#2563eb",

  color: "#fff",

  border: "none",

  borderRadius: "6px",

  cursor: "pointer",

  fontWeight: "bold",

};