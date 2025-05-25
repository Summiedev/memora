import Navbar from "../components/Navbar";
import middle from "../assets/middle.png";
import bg_image from "../assets/bg_image.png";
import left from "../assets/left.png";
import right from "../assets/right.png";  

const HomePage = () => {
  return (
    <div>
      {/* Navbar Component */}
      <Navbar />

      <section className="relative bg-cover bg-center h-[66vh]" style={{ backgroundImage: `url(${bg_image})` }}>
        <div className="absolute inset-0 bg-black opacity-50"></div> {/* Dark overlay */}
        <div className="relative z-10 flex items-center justify-center h-full text-center text-white px-6">
          <div>
            <h1 className="text-4xl font-extrabold mb-4">Welcome to the Time Capsule App</h1>
            <p className="text-lg mb-6">Store your memories and important milestones in a digital time capsule.</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300">
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Three Cards Section */}
      <section className="bg-black py-6">
        <div className="max-w-7xl mx-auto px-2">
         
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
            {/* Card 1 */}
            <div className=" shadow-lg overflow-hidden flex flex-col items-center p-3 text-center">
              <img src={left} alt="Feature 1" className="w-12 h-12 rounded-full object-cover"/>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white">Capture Memories</h3>
                <p className="text-white mt-2">Create time capsules filled with your treasured memories, preserved for future generation to discover.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className=" shadow-lg overflow-hidden flex flex-col items-center p-3 text-center">
              <img src={middle} alt="Feature 2" className="w-12 h-12 rounded-full object-cover"/>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white">Secure Vault</h3>
                <p className="text-white mt-2">Store your capsules in a secure, digital vault with state-of-the-art encryption and protection.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="shadow-lg overflow-hidden flex flex-col items-center p-6 text-center">
              <img src={right} alt="Feature 3" className="w-12 h-12 rounded-full object-cover"/>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white">Timeline Journey</h3>
                <p className="text-white mt-2">Embark on a journey through time with our interactive timeline feature, showcasing your capsules.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="bg-gray-800 shadow-lg text-white py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-sm">© 2023 Time Capsule App. All rights reserved.</span>
          <div className="mt-3">
            <a href="#" className="text-gray-400 hover:text-gray-300 mx-2">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-gray-300 mx-2">Terms of Service</a>
            </div>
        </div>

      </section>
    </div>
  );
};
  
  export default HomePage;