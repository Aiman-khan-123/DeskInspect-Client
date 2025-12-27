// pages/AdminEventPage.js
import React, { useEffect, useState, useCallback } from "react";
import {
  FaCalendarPlus,
  FaTrash,
  FaEdit,
  FaFolder,
  FaFileAlt,
  FaGraduationCap,
} from "react-icons/fa";
import AdminHeader from "../components/AdminHeader";

const AdminEventPage = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    name: "",
    type: "",
    startDate: "",
    endDate: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Event type options
  const eventTypes = [
    { value: "Thesis Submission", label: "Thesis Submission", icon: FaFileAlt },
    {
      value: "Thesis Resubmission",
      label: "Thesis Resubmission",
      icon: FaFolder,
    },
    { value: "General", label: "General Event", icon: FaCalendarPlus },
    { value: "Meeting", label: "Meeting", icon: FaCalendarPlus },
    { value: "Workshop", label: "Workshop", icon: FaGraduationCap },
    { value: "Deadline", label: "Deadline", icon: FaCalendarPlus },
  ];

  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/events`);
      const data = await res.json();
      setEvents(data);
    } catch (e) {
      console.error("Failed to load events", e);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const toDateOnly = (val) => {
    if (!val) return "";
    return val.substring(0, 10);
  };

  const handleAddOrUpdate = async () => {
    if (!newEvent.name || !newEvent.endDate || !newEvent.type) {
      alert("Please fill all required fields: Name, Type, and Due Date");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: newEvent.name,
        type: newEvent.type,
        startDate: toDateOnly(newEvent.startDate) || null,
        endDate: toDateOnly(newEvent.endDate),
      };

      let response;
      if (editingId) {
        response = await fetch(`${apiBase}/api/events/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${apiBase}/api/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (response.ok) {
        // If it's a thesis event, trigger folder creation
        if (newEvent.type.includes("Thesis")) {
          const eventId = editingId || result.event?._id || result._id;
          if (eventId) {
            await triggerThesisFolderCreation(eventId, payload);
          }
        }

        setNewEvent({ name: "", type: "", startDate: "", endDate: "" });
        setEditingId(null);
        await loadEvents();
        alert(
          editingId
            ? "Event updated successfully!"
            : "Event created successfully!"
        );
      } else {
        throw new Error(result.message || "Failed to save event");
      }
    } catch (e) {
      console.error("Failed to save event", e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const triggerThesisFolderCreation = async (eventId, eventData) => {
    try {
      const response = await fetch(
        `${apiBase}/api/thesis/schedule-folder-creation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: eventId,
            eventName: eventData.name,
            eventType: eventData.type,
            dueDate: eventData.endDate,
          }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        console.log("✅ Thesis folder creation scheduled:", result);
      } else {
        console.warn("⚠️ Folder scheduling failed:", result.message);
      }
    } catch (error) {
      console.error("❌ Error triggering folder creation:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/api/events/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadEvents();
        alert("Event deleted successfully!");
      } else {
        throw new Error("Failed to delete event");
      }
    } catch (e) {
      console.error("Failed to delete event", e);
      alert("Error deleting event");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (evt) => {
    setEditingId(evt._id);
    setNewEvent({
      name: evt.name || "",
      type: evt.type || "",
      startDate: evt.startDate ? evt.startDate.substring(0, 10) : "",
      endDate: evt.endDate ? evt.endDate.substring(0, 10) : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewEvent({ name: "", type: "", startDate: "", endDate: "" });
  };

  const getEventIcon = (eventType) => {
    const eventTypeObj = eventTypes.find((et) => et.value === eventType);
    const IconComponent = eventTypeObj?.icon || FaCalendarPlus;
    return <IconComponent className="text-[#6B46C1] text-xl" />;
  };

  const getEventTypeColor = (eventType) => {
    if (eventType.includes("Thesis")) return "bg-blue-100 text-blue-800";
    if (eventType === "General") return "bg-gray-100 text-gray-800";
    if (eventType === "Meeting") return "bg-green-100 text-green-800";
    if (eventType === "Workshop") return "bg-purple-100 text-purple-800";
    if (eventType === "Deadline") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminHeader />

      <main className="flex-grow flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
        {/* Events List */}
        <div className="w-full lg:w-2/5 bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Events List</h2>
            <span className="text-sm text-gray-500">
              {events.length} event(s)
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B46C1] mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FaCalendarPlus className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No events found</p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first event using the form
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getEventIcon(event.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {event.name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(
                              event.type
                            )}`}
                          >
                            {event.type}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Due:</span>{" "}
                            {new Date(event.endDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                          {event.startDate && (
                            <p>
                              <span className="font-medium">Start:</span>{" "}
                              {new Date(event.startDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          )}
                          {event.thesisFolderCreated &&
                            event.type.includes("Thesis") && (
                              <p className="text-green-600 text-xs font-medium">
                                ✓ Submission folder ready
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title="Edit event"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        title="Delete event"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Form */}
        <div className="w-full lg:w-3/5 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            {editingId ? "EDIT EVENT" : "CREATE NEW EVENT"}
          </h2>

          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                name="name"
                value={newEvent.name}
                onChange={handleChange}
                placeholder="e.g., Fall 2024 Thesis Submission"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
                required
              />
            </div>

            {/* Event Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type *
              </label>
              <select
                name="type"
                value={newEvent.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
                required
              >
                <option value="">Select Event Type</option>
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {newEvent.type.includes("Thesis") && (
                <p className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded">
                  <FaFolder className="inline mr-1" />
                  Submission folder will be created automatically 2 weeks before
                  due date
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={newEvent.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={newEvent.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {editingId && (
                <button
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={loading}
                >
                  Cancel Edit
                </button>
              )}
              <button
                onClick={handleAddOrUpdate}
                disabled={
                  loading ||
                  !newEvent.name ||
                  !newEvent.endDate ||
                  !newEvent.type
                }
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  loading ||
                  !newEvent.name ||
                  !newEvent.endDate ||
                  !newEvent.type
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#6B46C1] text-white hover:bg-[#553399]"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingId ? "Updating..." : "Creating..."}
                  </div>
                ) : editingId ? (
                  "Update Event"
                ) : (
                  "Create Event"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#F3F0FF] border-t border-[#E9E3FF] py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#6B46C1] font-medium">
            © 2025 DeskInspect. All rights reserved. | Admin Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminEventPage;
