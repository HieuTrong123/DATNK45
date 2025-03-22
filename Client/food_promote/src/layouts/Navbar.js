import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavEnum from "../common/emun/navEnum";
import classes from './layout.module.css'
import logo from '../assets/logo.png';
import Button from "../components/common/Button/Button";
import { useUser } from "../hook/userContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const { state, dispatch } = useUser();
    const { user } = state;
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 1);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const HandleSignOut = () => {
        dispatch({ type: "LOGOUT" });
        navigate("/login");
    }
    return (

        <div className={` ${classes.header} ${scrolled ? `${classes.scrolled}` : ""}`}>

            <div className={`grid wide ${classes.container}`}>
                <Link to={NavEnum.HOME}>
                    <img className={classes.logo} src={logo} alt="logo" />
                </Link>
                <div className={classes.nav}>
                    <Link to={NavEnum.HOME} className={classes.nav_item}>
                        <h4>Home</h4>
                    </Link>
                    <Link to={NavEnum.LOCAL_DISHES} className={classes.nav_item}>
                        <h4>Local Dishes</h4>
                    </Link>
                    <Link to={NavEnum.DINING_PLACES} className={classes.nav_item}>
                        <h4>Dining Places</h4>
                    </Link>
                    <Link to={NavEnum.BLOGS_AND_NEWS} className={classes.nav_item}>
                        <h4>Blogs & News</h4>
                    </Link>
                </div>
                <div className={classes.btn_box}>
                    {!user ? <>
                        <Link to='/signup'>
                            <Button effect={true}>Signup</Button>
                        </Link>
                        <Link to='/login'>
                            <Button>Login</Button>
                        </Link></> :
                        <>
                            <div className={classes.info}>
                                <p>
                                    {user.first_name} {user.last_name}
                                </p>
                                <span onClick={HandleSignOut}>sign out</span>
                            </div>
                            <Link to='/profile'>
                                <div style={{
                                    backgroundImage: `url(${user.avatar})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }}
                                    className={classes.avt}></div>
                            </Link>


                        </>}

                </div>
            </div>
        </div>
    )
}
