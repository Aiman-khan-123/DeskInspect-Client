import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaBellSlash,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import FacultyHeader from "../components/FacultyHeader";

const apiBase = process.env.REACT_APP_API_URL;

const formatDate = (isoOrDateOnly) => {
  const d =
    typeof isoOrDateOnly === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(isoOrDateOnly)
      ? new Date(`${isoOrDateOnly}T00:00:00`)
      : new Date(isoOrDateOnly);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const FacultyEventPage = () => {
  const [events, setEvents] = useState([]);
  const [reminders, setReminders] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [tempDate, setTempDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const remindersKey = (email) => `reminders:${email}`;
  const processedKey = (email) => `reminders_processed:${email}`;

  const loadEvents = async () => {
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
  };

  useEffect(() => {
    loadEvents();
    const id = setInterval(loadEvents, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.email) return;
    setUserEmail(user.email);

    const saved = localStorage.getItem(remindersKey(user.email));
    if (saved) {
      try {
        setReminders(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const startEdit = (id) => {
    setEditingId(id);
    setTempDate(reminders[id] || "");
  };

  const saveReminder = (id) => {
    if (tempDate) {
      const email =
        userEmail || JSON.parse(localStorage.getItem("user"))?.email || "";
      setReminders((r) => {
        const next = { ...r, [id]: tempDate };
        if (email)
          localStorage.setItem(remindersKey(email), JSON.stringify(next));
        return next;
      });
    } else {
      deleteReminder(id);
    }
    setEditingId(null);
  };

  const deleteReminder = (id) => {
    setReminders((r) => {
      const next = { ...r };
      delete next[id];
      if (userEmail)
        localStorage.setItem(remindersKey(userEmail), JSON.stringify(next));
      if (userEmail) {
        const processedRaw = localStorage.getItem(processedKey(userEmail));
        const processed = processedRaw ? JSON.parse(processedRaw) : {};
        if (processed[id]) {
          delete processed[id];
          localStorage.setItem(
            processedKey(userEmail),
            JSON.stringify(processed)
          );
        }
      }
      return next;
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTempDate("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FacultyHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B46C1] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <FacultyHeader />

      <main className="flex-grow p-6 max-w-6xl mx-auto w-full">
        {/* Header card */}
        <div className="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] rounded-2xl shadow-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-0">
              <div className="p-3 sm:p-4 bg-white bg-opacity-20 rounded-2xl">
                <FaCalendarAlt className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Faculty Events
                </h1>
                <p className="text-white text-opacity-90 text-sm sm:text-base">
                  Manage and set reminders for important faculty events
                </p>
              </div>
            </div>

            <div className="text-white text-center">
              <div className="text-2xl sm:text-3xl font-bold">
                {events.length}
              </div>
              <div className="text-sm opacity-80">Total Events</div>
            </div>
          </div>
        </div>

        {/* Events list */}
        {events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Events Available
            </h3>
            <p className="text-gray-500">
              Check back later for upcoming faculty events.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {events.map((evt) => (
              <div
                key={evt._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 pr-4">
                          {evt.name}
                        </h3>
                        <div className="flex-shrink-0 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          Due: {formatDate(evt.endDate)}
                        </div>
                      </div>

                      {reminders[evt._id] && (
                        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                          <FaBell className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Reminder set for{" "}
                            {new Date(reminders[evt._id]).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {editingId === evt._id ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="datetime-local"
                            value={tempDate}
                            onChange={(e) => setTempDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#575C9E] focus:border-transparent"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveReminder(evt._id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : reminders[evt._id] ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(evt._id)}
                            className="flex items-center gap-2 bg-[#6B46C1] text-white px-4 py-2 rounded-lg hover:bg-[#8B5CF6] transition-colors font-medium"
                          >
                            <FaEdit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteReminder(evt._id)}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(evt._id)}
                          className="flex items-center gap-2 bg-[#6B46C1] text-white px-6 py-3 rounded-lg hover:bg-[#8B5CF6] transition-colors font-medium"
                        >
                          <FaBell className="w-4 h-4" />
                          Set Reminder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-[#F3F0FF] border-t border-[#E9E3FF] py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#6B46C1] font-medium">
            © 2025 DeskInspect. All rights reserved. | Faculty Events
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FacultyEventPage;
