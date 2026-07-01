import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be at most 128 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(255, "Name must be at most 255 characters")
      .transform((v) => v.trim()),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/\d/, "Password must contain a digit")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain a special character"
      ),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be at most 255 characters")
    .optional(),
  monthly_income: z
    .number()
    .min(0, "Income must be non-negative")
    .max(999_999_999.99, "Income exceeds maximum")
    .optional(),
  currency: z
    .string()
    .length(3, "Currency code must be exactly 3 characters")
    .regex(/^[A-Z]{3}$/, "Currency must be a valid ISO code (e.g., INR)")
    .optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
