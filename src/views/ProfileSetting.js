// src/components/ProfileSettings.js
import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/useAxios";
import { useHistory } from "react-router-dom";

const ProfileSettings = () => {
    const [profileData, setProfileData] = useState({
        full_name: "",
        bio: "",
        image: null,
    });
    const [previewImage, setPreviewImage] = useState(null);
    const history = useHistory();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axiosInstance.get("/profile/");
                setProfileData(response.data);
                setPreviewImage(response.data.image);
            } catch (error) {
                console.error("Error fetching profile data", error);
            }
        };
        fetchProfileData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setProfileData((prevData) => ({ ...prevData, image: file }));
        setPreviewImage(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("full_name", profileData.full_name);
        formData.append("bio", profileData.bio);
        if (profileData.image) {
            formData.append("image", profileData.image);
        }

        try {
            await axiosInstance.put("/profile/update/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Profile updated successfully!");
            history.push("/profile");
        } catch (error) {
            console.error("Error updating profile", error);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Public Info</h2>
            <form onSubmit={handleSubmit} className="row">
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label htmlFor="full_name">Username</label>
                        <input
                            type="text"
                            name="full_name"
                            className="form-control"
                            placeholder="Username"
                            value={profileData.full_name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="bio">Biography</label>
                        <textarea
                            name="bio"
                            className="form-control"
                            placeholder="Tell something about yourself"
                            value={profileData.bio}
                            onChange={handleInputChange}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
                
                <div className="col-md-6 d-flex flex-column align-items-center">
                    <div className="mb-3">
                        {previewImage ? (
                            <img src={previewImage} alt="Preview" className="rounded-circle" width="128" height="128" />
                        ) : (
                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: "128px", height: "128px" }}>
                                <span className="text-secondary">No Image</span>
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="image" className="btn btn-outline-primary">
                            <i className="fas fa-upload"></i> Upload Image
                        </label>
                        <input
                            type="file"
                            id="image"
                            className="d-none"
                            onChange={handleImageChange}
                        />
                    </div>
                    <small className="form-text text-muted">
                        For best results, use an image at least 128px by 128px in .jpg format
                    </small>
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;
