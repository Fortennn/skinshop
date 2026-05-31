import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="relative mt-auto w-full bg-dark-950/90 border-t border-white/5 backdrop-blur-md z-10 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent-cyan/2 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-accent-purple/2 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-left">
          
          {/* Logo & Description */}
          <div className="flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 3 }}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-tr from-accent-cyan via-accent-blue to-accent-purple p-[1.5px] shadow-[0_0_10px_rgba(0,242,254,0.3)]"
              >
                <div className="w-full h-full bg-dark-900 rounded-[7px] flex items-center justify-center">
                  <span className="text-accent-cyan font-black text-sm text-glow-cyan">V</span>
                </div>
              </motion.div>
              <span className="text-white font-black text-lg tracking-wider font-sans group-hover:text-accent-cyan transition-colors duration-300">
                VALKYRIE
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              The premier destination for CS2 enthusiasts. Forge your inventory with the rarest skins in the game and experience next-generation lightning-fast trading.
            </p>
            
            {/* Social Icons with Interactive Glow */}
            <div className="flex items-center gap-3 mt-1">
              {[
                { 
                  name: 'X', 
                  svg: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>, 
                  href: '#', 
                  color: 'hover:text-accent-cyan hover:border-accent-cyan/40 hover:shadow-[0_0_15px_rgba(0,242,254,0.3)]' 
                },
                { 
                  name: 'Discord', 
                  svg: <svg className="w-4 h-4 fill-current" viewBox="0 0 127.14 96.36"><path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c1.07-.79,2.12-1.61,3.12-2.47a75.47,75.47,0,0,0,71.86,0c1,.86,2,1.68,3.12,2.47a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,32.58-18.83C129.1,54.65,122.58,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/></svg>, 
                  href: '#', 
                  color: 'hover:text-accent-purple hover:border-accent-purple/40 hover:shadow-[0_0_15px_rgba(138,43,226,0.3)]' 
                },
                { 
                  name: 'Steam', 
                  svg: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 .002C5.373.002.001 5.374.001 12c0 5.49 3.69 10.117 8.74 11.59l1.04-3.52c-.1-.08-.18-.17-.25-.27l-2.69-1.92c-.65-.46-.8-1.35-.34-2l2.69-3.8c.3-.43.79-.65,1.28-.59l4.57.57c.36-.2.77-.32 1.2-.32 1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5c-.77 0-1.46-.35-1.92-.9l-3.32.74c-.03.45-.23.88-.59,1.18l-2.69 1.92c-.31.22-.67.31-1.03.27l1.06-3.6c.39.06.79-.04,1.11-.27l2.69-1.92c.31-.22.67-.31,1.03-.27z"/></svg>, 
                  href: '#', 
                  color: 'hover:text-accent-pink hover:border-accent-pink/40 hover:shadow-[0_0_15px_rgba(255,0,127,0.3)]' 
                }
              ].map((social, idx) => {
                return (
                  <motion.a 
                    key={idx}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    href={social.href} 
                    className={`p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 transition-all duration-300 ${social.color}`}
                    aria-label={social.name}
                  >
                    {social.svg}
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-5">
            <h4 className="text-xs font-black tracking-widest text-white uppercase border-l-2 border-accent-cyan pl-2.5">
              Navigation
            </h4>
            <ul className="flex flex-col gap-3 text-xs text-gray-400 font-semibold">
              <li>
                <Link to="/" className="hover:text-accent-cyan transition-colors duration-200 uppercase tracking-wider text-[11px]">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-accent-cyan transition-colors duration-200 uppercase tracking-wider text-[11px]">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-accent-cyan transition-colors duration-200 uppercase tracking-wider text-[11px]">
                  My Inventory
                </Link>
              </li>
              <li>
                <span className="text-gray-600 cursor-not-allowed uppercase tracking-wider text-[11px]">FAQ (Coming 2026)</span>
              </li>
            </ul>
          </div>

          {/* Support / Security */}
          <div className="flex flex-col gap-5">
            <h4 className="text-xs font-black tracking-widest text-white uppercase border-l-2 border-accent-cyan pl-2.5">
              Security & Policy
            </h4>
            <ul className="flex flex-col gap-3 text-xs text-gray-400 font-semibold">
              <li>
                <span className="flex items-center gap-1.5 text-accent-cyan font-bold tracking-wider text-[10px]">
                  <ShieldCheck className="w-4 h-4 text-glow-cyan" /> SECURE TRADE ESCROW
                </span>
              </li>
              <li>
                <span className="hover:text-accent-cyan cursor-pointer transition-colors duration-200 uppercase tracking-wider text-[11px]">Terms of Service</span>
              </li>
              <li>
                <span className="hover:text-accent-cyan cursor-pointer transition-colors duration-200 uppercase tracking-wider text-[11px]">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-accent-cyan cursor-pointer transition-colors duration-200 uppercase tracking-wider text-[11px]">Help Desk Support</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="flex flex-col gap-5">
            <h4 className="text-xs font-black tracking-widest text-white uppercase border-l-2 border-accent-cyan pl-2.5">
              Newsletter
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Get the latest skin drops, market fluctuations, and promo deals sent directly to your screen.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center group">
              <input 
                type="email" 
                placeholder="Enter email address..." 
                className="w-full pl-4 pr-12 py-3 bg-dark-900/50 border border-white/5 focus:border-accent-cyan/40 hover:border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-cyan/20 transition-all font-sans relative z-10"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple opacity-0 group-hover:opacity-10 group-focus-within:opacity-20 blur-md transition-opacity duration-300 pointer-events-none" />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                type="submit" 
                className="absolute right-1.5 p-2 rounded-lg bg-accent-cyan hover:bg-accent-cyan/90 text-dark-950 transition-all shadow-[0_0_10px_rgba(0,242,254,0.3)] z-20 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            </form>
          </div>

        </div>

        {/* Separator & Trademark */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-gray-500 max-w-3xl leading-relaxed text-center md:text-left font-medium">
            &copy; 2026 VALKYRIE CS2. Not affiliated with Valve Corp. Counter-Strike, CS:GO, CS2, and Steam are registered trademarks of Valve Corporation. Valkyrie operates as an independent peer-to-peer item exchange system.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-gray-300 font-black bg-white/5 border border-white/5 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse text-glow-cyan" />
            <span className="tracking-widest uppercase text-[9px]">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
