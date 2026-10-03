import React, { useEffect } from "react";
import "../../css/ForgetPassword.css";
import { Field, useForm } from "@tanstack/react-form";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../store/User/user-action";
import toast from "react-hot-toast";

const ForgetPassword = () => {
  const { errors } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      try {
        const response = await dispatch(forgotPassword(value.email));
        if (response) {
          toast.success(response.message || "Email Sent! Please Check your Email");
        }
      } catch (error) {
        // Error toast is handled by the useEffect watching user.errors
      }
    },
  });

  useEffect(() => {
    if (errors) {
      toast.error(errors);
    }
  }, [errors]);

  return (
    <>
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <h1 className="password_title">Forget Password</h1>
            <form.Field name="email">
              {(field) => (
                <div className="form-group">
                  <label htmlFor="email_field">Enter Email</label>
                  <input
                    type="email"
                    id="email_field"
                    className="form-control"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <button
              id="forgot_password_button"
              type="submit"
              className="btn-block py-3 password-btn"
              disabled={form.state.isSubmitting}
            >
              {form.state.isSubmitting ? "Sending..." : "Send Email"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgetPassword;
