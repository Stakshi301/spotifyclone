import { signIn } from 'next-auth/react';
import React from 'react';

const Login = () => {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-r from-green-300 to-slate-700 ">
            <button onClick={() => {
                signIn('spotify', { callbackUrl: "/" })
            }} className='bg-green-600 p-5 rounded-full hover:bg-green-700'>Login with Spotify</button>
        </div>
    );
}

export default Login;
