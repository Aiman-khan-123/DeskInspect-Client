import React from "react";
import { motion } from "framer-motion";

const FooterColumn = ({ heading, links }) => {
  return (
    <div>
      <h3 className="text-lg font-bold mb-4 text-white">{heading}</h3>
      <ul className="space-y-3">
        {links.map((link, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            viewport={{ once: true }}
          >
            <button
              onClick={() => {}}
              className="text-gray-400 hover:text-[#8B5CF6] transition-colors duration-300 text-sm flex items-center group"
            >
              <span className="w-0 h-0.5 bg-[#8B5CF6] group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
              {link}
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default FooterColumn;
