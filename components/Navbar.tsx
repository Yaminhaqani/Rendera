import { Box } from "lucide-react"
import { navLinks } from "~/constants/navLinks"
import Button from "./ui/Button";
import { useOutletContext } from "react-router";

const Navbar = () => {
   const {isSignedIn, userName, signIn, signOut} = useOutletContext<AuthContext>();

    const handleAuthClick = async()=>{
        if(isSignedIn){
            try {
                await signOut();
            } catch (error) {
                console.error(`Puter sign out failed: ${error}`); 
            }
            return; //exits the func if user is signed in
        }

        try {
            await signIn();
        } catch (error) {
            console.error(`Puter sign in failed: ${error}`); 
        }
    };
  return (
    <header className="navbar">
        <nav className="inner">
            <div className="left">
                <div className="brand">
                    <Box className="logo" />
                    <span className="name">
                        Rendera
                    </span>
                </div>
                {/* <ul className="links">
                    <a href="#">Product</a>
                    <a href="#">Pricing</a>
                    <a href="#">Community</a>
                    <a href="#">Enterprise</a>
                </ul> */}

                <ul className="links">
                     {navLinks.map((link)=>(
                    <a key={link.id} href={link.to}>{link.label}</a>
                ))}
                </ul>
            
            </div>

            <div className="actions">
                {isSignedIn ? (
                    <>
                    <span className="greeting">
                        {userName ? `Hi, ${userName}` : 'Signed in'}
                    </span>

                    <Button size="sm" onClick={handleAuthClick} className="btn">
                        Log Out
                    </Button>
                    </>

                ):(
                    <>
                    <Button onClick={handleAuthClick}
                size="sm" variant="ghost"
                >
                    Log In
                </Button>

                <a href="#upload"
                className="cta"
                >GET STARTED</a>
                    </>
                )}
                

                
            </div>
        </nav>
        </header>
  )
}

export default Navbar