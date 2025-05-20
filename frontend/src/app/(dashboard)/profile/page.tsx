"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FiEdit2, FiX } from "react-icons/fi";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Not authenticated");

      // Update profile data
      const profileResponse = await fetch("http://localhost:5000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!profileResponse.ok) {
        throw new Error("Failed to update profile");
      }

      // Only update password if all password fields are filled
      if (passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          toast.error("New passwords do not match");
          setIsLoading(false);
          return;
        }

        const passwordResponse = await fetch("http://localhost:5000/api/users/change-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        });

        if (!passwordResponse.ok) {
          const data = await passwordResponse.json();
          throw new Error(data.message || "Failed to change password");
        }

        // Clear password fields after successful update
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      await updateUser(); // Refresh user data
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Reset form data to original values when canceling edit
      setFormData({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleEdit}
          className="flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <FiX className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <FiEdit2 className="w-4 h-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Last Name
              </label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <Input
              type="email"
              id="email"
              value={user?.email || ""}
              disabled
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-500">Email address cannot be changed</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Change Password</h2>
            <p className="text-sm text-gray-500">Leave blank if you don't want to change your password</p>
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                Current Password
              </label>
              <Input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <Input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
} 