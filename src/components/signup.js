import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "../App.css";

function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false); // Loading state

  //   const BASE_URL = "http://localhost:3001/auth";
  const BASE_URL = "https://olostep-eb5687f86578.herokuapp.com/";

  const toggleForm = () => setIsLogin(!isLogin);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true); // Start loading

      const payload = { email: values.email, password: values.password };

      try {
        const response = await fetch(
          `${BASE_URL}/${isLogin ? "login" : "register"}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message || "There was a problem with the operation");
          return;
        }

        toast.success(`Successfully ${isLogin ? "logged in" : "signed up"}!`);
        console.log("Token:", data.token);
        console.log("User:", data.user);

        localStorage.setItem("authToken", data.token);
        onClose();
      } catch (error) {
        console.error("There was a problem with the operation:", error);
        toast.error("An error occurred. Please try again.");
      } finally {
        setLoading(false); // Stop loading
      }
    },
  });

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black opacity-50 fixed inset-0"></div>
          <div className="bg-white p-6 rounded-lg shadow-lg z-10 max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">
              {isLogin ? "Login" : "Sign Up"}
            </h2>
            <form onSubmit={formik.handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Enter your email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-500">{formik.errors.email}</div>
                ) : null}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Enter your password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
                {formik.touched.password && formik.errors.password ? (
                  <div className="text-red-500">{formik.errors.password}</div>
                ) : null}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? (
                  <div className="loader"></div> // Replace with your loader component or spinner
                ) : isLogin ? (
                  "Login"
                ) : (
                  "Sign Up"
                )}{" "}
              </button>
            </form>
            <p className="text-center mt-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="text-blue-500 underline"
                onClick={toggleForm}
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default AuthModal;
