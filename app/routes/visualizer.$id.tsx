import { useLocation, useParams } from "react-router"

const VisualizerId = () => {

//   useLocation() gives:
//   {
//   pathname: "/visualizer/123",
//   search: "",
//   hash: "",
//   state: { ... }   // 👈 YOUR DATA
// }

  const location = useLocation();

  //if user directly opens this page, empty object {} otherwise without fallback, crash
  const { initialImage, name } = location.state || {};
  const {id} = useParams();
  console.log('id is',id);
  

  return (
    <section>
      <h1> {name || 'Untitled Project'} </h1>

      <div className="visualizer">
        {initialImage && (
          <div className="image-container">
            <h2>Source Image</h2>
            <img src={initialImage} alt="source" />
          </div>
        )
        }
      </div>
    </section>
  )
}

export default VisualizerId