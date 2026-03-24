"use server"
import { cookies } from "next/headers"

export async function login(password: string) {
  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) return { success: false, error: "Server nemá v proměnných nastaveno heslo (ADMIN_PASSWORD)! Tím je zamezen přístup komukoliv." }

  if (password === envPassword) {
    const cookieStore = await cookies()
    cookieStore.set("admin_token", password, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      maxAge: 60 * 60 * 24 * 30,
      path: "/"
    })
    return { success: true }
  }
  return { success: false, error: "Nesprávné heslo" }
}
