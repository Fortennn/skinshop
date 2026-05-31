import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children, title }) => {
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-[10px]"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="relative w-full max-w-[460px] rounded-2xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.9)]"
            style={{ zIndex: 1 }}
          >
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-[#0a0e16]/95 backdrop-blur-2xl" />
            <div className="absolute inset-0 border border-white/[0.07] rounded-2xl pointer-events-none" />

            {/* Neon top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple shadow-[0_0_16px_rgba(0,242,254,0.7)]" />

            {/* Modal Header */}
            <div className="relative px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-sm font-black text-white tracking-widest uppercase">
                {title}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] hover:text-accent-cyan text-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Modal Body */}
            <div className="relative p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
