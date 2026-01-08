import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Dashboard.css";  // Custom CSS for the dashboard

function Dashboard() {
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/creators");
        setCreators(response.data.creators);  // Assuming your API returns creators list
      } catch (error) {
        console.error("Error fetching creators:", error);
      }
    };

    fetchCreators();
  }, []);

  // Settings for the react-slick carousel
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,  // For larger screens
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,  // For tablets
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1
        }
      }
    ]
  };

  return (
    <div className="dashboard">
      <h1>Creator Spotlight</h1>
      <Slider {...settings}>
        {creators.map((creator, index) => (
          <div key={index} className="creator-card">
            <div className="creator-info">
              <h3>{creator.Name}</h3>
              <p><strong>Topic:</strong> {creator.Topics}</p>
              <p><strong>Followers:</strong> {creator.Followers}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default Dashboard;
