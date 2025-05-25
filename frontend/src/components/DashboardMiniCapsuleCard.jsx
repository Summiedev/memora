import { motion } from 'framer-motion';

const MiniCapsule = ({ title, date, description, tags, status }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="w-[270px] bg-gradient-to-br from-[#e0f2ff] to-[#f2f7ff] rounded-2xl p-4 shadow-md border border-[#dbeafe] flex flex-col justify-between h-[200px] transition-all"
    >
      {/* Top section: Title and date */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold quicksand text-lg text-indigo-600 overflow-hidden text-ellipsis whitespace-normal break-words">
            {title}
          </h3>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        <p className="text-sm text-gray-600 font-medium mb-3 quicksand overflow-hidden text-ellipsis whitespace-normal break-words">
          {description}
        </p>
      </div>

      {/* Bottom section: Tags and Status */}
      <div className="mt-auto">
        <div className="flex flex-wrap gap-2 text-xs mb-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`${
                tag.includes('Family') ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-500'
              } px-2 py-1 rounded-full`}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="text-right text-gray-400 text-sm">{status}</div>
      </div>
    </motion.div>
  );
};

export default MiniCapsule;
