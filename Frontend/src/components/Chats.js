import React, {useRef, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { ChatEngine } from 'react-chat-engine';
import { auth } from '../firebase';

import { FaVideo } from  "react-icons/fa";

import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';


// Making a Group or Teams Page
const Chats = () => {
    const history = useHistory();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    console.log(user);
    const handleLogout = async () => {
        await auth.signOut();
        history.push('/');
    }

    const getFile = async (url) => {
        const response = await fetch(url);
        const data = await response.blob();

        return new File([data], "userPhoto.jpg", { type: 'image/jpeg' })
    }

    useEffect(() => {
        if(!user){
            history.push('/');
            return;
        }

        axios.get('https://api.chatengine.io/users/me/', {
            headers: {
                "project-id": process.env.REACT_APP_CHAT_ENGINE_ID,
                "user-name": user.email,
                "user-secret": user.uid,
            }
        })
        .then(() => {
            setLoading(false);
        })
        .catch(() => {
            let formdata = new FormData();
            formdata.append('email', user.email);
            formdata.append('username', user.email);
            formdata.append('secret', user.uid);

            getFile(user.photoURL)
                .then((avatar) => {
                    formdata.append('avatar', avatar, avatar.name);

                    axios.post('https://api.chatengine.io/users/',
                        formdata, 
                        { headers: {"private-key": process.env.REACT_APP_CHAT_ENGINE_KEY }}
                    )
                    .then(() => setLoading(false))
                    .catch((error) => console.log(error))
                })
        })
    }, [user, history]);

    if(!user || loading) return 'loading....';

    return (
        <div className="chats-page">
            <div className="nav-bar">
                <div className="logo-tab">
                    Microsoft Teams  
                    {/* <a href="http://localhost:3030"><FaVideo size="1.2em" color="white" left="100px" position="centre"/></a> */}
                    {/* <i class="fas fa-Video"></i>   Video Call */}
                </div>

                <div className="icons">
                <a href=" https://video-call-bysejal.herokuapp.com/"><FaVideo calls size="2em" color="white" left="100px" position="centre"/></a>
                </div>
                
                {/* https://teams-video-call.herokuapp.com/ */}
                <div onClick={handleLogout} className="logout-tab">
                    Logout
                </div>
            </div>

            <ChatEngine
                height="calc(100vh - 66px)"
                projectID={process.env.REACT_APP_CHAT_ENGINE_ID}
                userName={user.email}
                userSecret={user.uid}
            />
        </div>
    );
}

export default Chats;