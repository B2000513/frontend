import { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { useHistory } from "react-router-dom";
import swal from "sweetalert2";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem("authTokens")
            ? JSON.parse(localStorage.getItem("authTokens"))
            : null
    );

    const [user, setUser] = useState(() =>
        localStorage.getItem("authTokens")
            ? jwt_decode(localStorage.getItem("authTokens"))
            : null
    );

    const [loading, setLoading] = useState(true);

    const history = useHistory();

    const loginUser = async (email, password) => {
        const response = await fetch("http://127.0.0.1:8000/api/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        const data = await response.json();
        console.log(data);

        if (response.status === 200) {
            const decodedToken = jwt_decode(data.access);

            // Check if the user is verified
            if (decodedToken.verified) {
                console.log("Logged In");
                setAuthTokens(data);
                setUser(decodedToken);
                localStorage.setItem("authTokens", JSON.stringify(data));
                history.push("/dashboard");

                swal.fire({
                    title: "Login Successful",
                    icon: "success",
                    toast: true,
                    timer: 6000,
                    position: "top-right",
                    timerProgressBar: true,
                    showConfirmButton: false,
                });

                window.location.reload();
            } else {
                // If not verified, show error
                swal.fire({
                    title: "Account not verified",
                    text: "Please check your email to verify your account.",
                    icon: "error",
                    toast: true,
                    timer: 6000,
                    position: "top-right",
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
            }
        } else {
            console.log(response.status);
            console.log("There was a server issue");
            swal.fire({
                title: "Invalid username or password",
                icon: "error",
                toast: true,
                timer: 6000,
                position: "top-right",
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    const registerUser = async (email, username, password, password2) => {
        const response = await fetch("http://127.0.0.1:8000/api/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                username,
                password,
                password2,
            }),
        });
        if (response.status === 201) {
            history.push("/login");
            swal.fire({
                title: "Registration Successful, Login Now",
                icon: "success",
                toast: true,
                timer: 6000,
                position: "top-right",
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } else {
            console.log(response.status);
            console.log("There was a server issue");
            swal.fire({
                title: "An Error Occurred " + response.status,
                icon: "error",
                toast: true,
                timer: 6000,
                position: "top-right",
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put("http://127.0.0.1:8000/api/profile/", profileData, {
                headers: {
                    "Content-Type": "aplication/json",
                    Authorization: `Bearer ${authTokens.access}`,
                },
                body: JSON.stringify(profileData),
            });

            const updatedUserData = response.data;

            // Update `user` state in AuthContext to reflect changes
            setUser((prevUser) => ({
                ...prevUser,
                ...updatedUserData,
            }));

            swal.fire({
                title: "Profile Updated Successfully",
                icon: "success",
                toast: true,
                timer: 6000,
                position: "top-right",
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Profile update failed:", error);

            swal.fire({
                title: "Failed to Update Profile",
                text: "An error occurred while updating the profile. Please try again.",
                icon: "error",
                toast: true,
                timer: 6000,
                position: "top-right",
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem("authTokens");
        history.push("/login");
        swal.fire({
            title: "You have been logged out",
            icon: "success",
            toast: true,
            timer: 6000,
            position: "top-right",
            timerProgressBar: true,
            showConfirmButton: false,
        });
        window.location.reload();
    };

    const contextData = {
        user,
        setUser,
        authTokens,
        setAuthTokens,
        registerUser,
        loginUser,
        logoutUser,
        updateProfile,
    };

    useEffect(() => {
        if (authTokens) {
            setUser(jwt_decode(authTokens.access));
        }
        setLoading(false);
    }, [authTokens, loading]);

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};
