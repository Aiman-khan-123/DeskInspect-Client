import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaQuoteLeft,
  FaStar,
  FaArrowRight,
  FaUserGraduate,
  FaChalkboardTeacher,
} from "react-icons/fa";

const testimonials = [
  {
    quote:
      "DeskInspect has revolutionized how we evaluate MS theses. The AI-driven assessment has significantly reduced our faculty workload while maintaining high evaluation standards.",
    name: "Dr. Sarah Johnson",
    title: "Department Chair, Computer Science",
    institution: "COMSATS University",
    rating: 5,
    type: "faculty",
  },
  {
    quote:
      "As a student, I appreciated how quickly I received detailed feedback on my thesis. The process was transparent and helped me improve significantly.",
    name: "Areeba Khalid",
    title: "MS Computer Science Student",
    institution: "COMSATS University",
    rating: 5,
    type: "student",
  },
  {
    quote:
      "DeskInspect ensures consistency in thesis evaluation, which used to be a major challenge for our department. Highly recommended!",
    name: "Prof. Amir Qureshi",
    title: "Professor, Software Engineering",
    institution: "COMSATS University",
    rating: 5,
    type: "faculty",
  },
  {
    quote:
      "Getting near-instant insights and plagiarism analysis helped me focus on improving content quality instead of stressing about formatting and review delays.",
    name: "Umar Farooq",
    title: "MS Data Science Student",
    institution: "COMSATS University",
    rating: 5,
    type: "student",
  },
];

const TestimonialsAndCTA = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(intervalId);
  }, []);

  const { quote, name, title, institution, rating, type } = testimonials[index];

  return (
    <div className="w-full">
      {/* Testimonials Section */}
      <section className="bg-white py-20 px-6 lg:px-12">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how DeskInspect is transforming the thesis evaluation process
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto relative min-h-[320px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                className="w-full bg-gray-50 rounded-xl border-2 border-gray-100 p-8 md:p-12 relative"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                {/* Quote Icon */}
                <div className="absolute top-8 left-8 text-6xl text-[#6B46C1]/10">
                  <FaQuoteLeft />
                </div>

                {/* Stars */}
                <div className="flex justify-center mb-6 space-x-1">
                  {[...Array(rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-xl" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xl md:text-2xl text-gray-800 italic mb-8 leading-relaxed text-center relative z-10">
                  "{quote}"
                </p>

                {/* Author Info */}
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6B46C1] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg">
                    {type === "faculty" ? (
                      <FaChalkboardTeacher className="text-2xl" />
                    ) : (
                      <FaUserGraduate className="text-2xl" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-[#6B46C1]">{name}</p>
                    <p className="text-gray-600 text-sm">{title}</p>
                    <p className="text-gray-500 text-xs">{institution}</p>
                  </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center mt-8 space-x-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i === index
                          ? "bg-[#6B46C1] w-8"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative bg-[#6B46C1] text-white py-20 px-6 lg:px-12">
        <motion.div
          className="container mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-6 leading-tight"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Ready to Transform Your
            <br />
            Thesis Evaluation Process?
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed text-white/90"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join academic institutions worldwide that are using DeskInspect to
            streamline their MS thesis assessment process with AI-powered
            precision.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <a
              href="/login"
              className="group bg-white text-[#6B46C1] font-bold px-10 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 inline-flex items-center space-x-2"
            >
              <span>Get Started Today</span>
              <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" />
            </a>
            <a
              href="#how-it-works"
              className="bg-white/10 backdrop-blur-sm text-white font-semibold px-10 py-4 rounded-lg border-2 border-white/30 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              Learn More
            </a>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default TestimonialsAndCTA;
