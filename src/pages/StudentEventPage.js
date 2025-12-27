import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaBellSlash,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import StudentHeader from "../components/StudentHeader";

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

const StudentEventPage = () => {
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
    const id = setInterval(loadEvents, 30000); // Reduced frequency
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
      const email =
        userEmail || JSON.parse(localStorage.getItem("user"))?.email || "";
      setReminders((r) => {
        const nxt = { ...r };
        delete nxt[id];
        if (email)
          localStorage.setItem(remindersKey(email), JSON.stringify(nxt));
        return nxt;
      });
    }
    setEditingId(null);
  };

  const deleteReminder = (id) => {
    setReminders((r) => {
      const nxt = { ...r };
      delete nxt[id];
      if (userEmail)
        localStorage.setItem(remindersKey(userEmail), JSON.stringify(nxt));
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
      return nxt;
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTempDate("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#575C9E] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentHeader />

      <main className="flex-grow p-6 max-w-6xl mx-auto w-full">
        {/* Header - Consistent with Admin Portal */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-0">
              <div className="p-3 sm:p-4 bg-[#6B46C1]/10 rounded-2xl">
                <FaCalendarAlt className="w-8 h-8 sm:w-10 sm:h-10 text-[#6B46C1]" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Academic Events
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Manage reminders for your important academic deadlines and
                  events
                </p>
              </div>
            </div>

            <div className="text-center bg-[#6B46C1]/10 px-6 py-3 rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-[#6B46C1]">
                {events.length}
              </div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Events Available
            </h3>
            <p className="text-gray-500">
              Check back later for upcoming academic events and deadlines.
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
                    {/* Event Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 pr-4">
                          {evt.name}
                        </h3>
                        <div className="flex-shrink-0 bg-[#6B46C1]/10 text-[#6B46C1] px-3 py-1 rounded-full text-sm font-medium">
                          Due: {formatDate(evt.endDate)}
                        </div>
                      </div>

                      {reminders[evt._id] && (
                        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200">
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
                          <div className="flex flex-col gap-2">
                            <input
                              type="datetime-local"
                              value={tempDate}
                              onChange={(e) => setTempDate(e.target.value)}
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveReminder(evt._id)}
                              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : reminders[evt._id] ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(evt._id)}
                            className="flex items-center gap-2 bg-[#6B46C1] text-white px-4 py-2 rounded-lg hover:bg-[#553399] transition-colors font-medium"
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
                          className="flex items-center gap-2 bg-[#6B46C1] text-white px-6 py-3 rounded-lg hover:bg-[#553399] transition-colors font-medium"
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

      <footer className="bg-[#F3F0FF] border-t border-[#E9E3FF] py-4 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#6B46C1] font-medium">
            © 2025 DeskInspect. All rights reserved. | Academic Events
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StudentEventPage;
