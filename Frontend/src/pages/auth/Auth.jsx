import React, { useState } from 'react';
import Background from '../../assets/login2.png';
import Victory from '../../assets/victory.svg';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';

export default function Auth(props) {
    const navigate = useNavigate();
    const setUserInfo = useAppStore.getState().setUserInfo;
    const [name, setName] = useState('');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const validateSignup = () => {
        if (!email.length) {
            toast.error("Email is required.");
            return false;
        }
        if (!password.length) {
            toast.error("Password is required.");
            return false;
        }
        if (password !== confirmPassword) {
            toast.error("Password and confirm password should be the same.");
            return false;
        }
        return true;
    }

    const validateLogin = () => {
        if (!email.length) {
            toast.error("Email is required");
            return false;
        }
        if (!password.length) {
            toast.error("Password is required");
            return false;
        }
        return true;
    }

    const handleLogin = async (event) => {
        event.preventDefault();
        if (validateLogin()) {
            await login();
        }
    };

    const handleSignup = async (event) => {
        event.preventDefault();
        if (validateSignup()) {
            await signup();
        }
    };

    const signup = async () => {
        try {
            console.log("Signup function executed");
            const response = await fetch('http://localhost:7052/signup', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: name, email, password }),
            });

            const responseData = await response.json();

            if (responseData.success) {
                localStorage.setItem('auth-token', responseData.token);
                //navigation after signup
                setUserInfo(responseData.user)
                navigate('/profile');
            } else {
                alert(responseData.error);
            }
        } catch (error) {
            console.log("error", error);
        }
    };

    const login = async () => {
        try {
            console.log("Login function executed");
            const response = await fetch('http://localhost:7052/login', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Ensures cookies are sent with the request
            });

            const responseData = await response.json();
           
            if (responseData.success) {
                localStorage.setItem('auth-token', responseData.token);
                // Check if responseData.user exists
                if (responseData.user) {
                    setUserInfo(responseData.user);
                
                    if (responseData.user.profileSetup) {
                        navigate('/chat');

                    } else {
                        navigate('/profile');
                    }
                } else {
                    console.error("User data is missing in the response");
                    alert("User data is missing in the response");
                }
            } else {
                alert(responseData.errors);
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-2xl rounded-3xl grid xl:grid-cols-2 w-11/12 max-w-6xl">
                <div className="flex flex-col items-center justify-center p-10 lg:p-20 gap-10">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">Welcome</h1>
                            <img src={Victory} alt="victory emoji" className="h-20 ml-4" />
                        </div>
                        <p className="font-medium">Fill in the details to get started with the chat app!</p>
                    </div>
                    <Tabs className="w-full" defaultValue='login'>
                        <TabsList className="flex justify-center space-x-4">
                            <TabsTrigger value="login" className="text-black text-opacity-90 border-b-2 pb-2 data-[state=active]:border-purple-500 data-[state=active]:font-semibold transition-all duration-300">
                                LOGIN
                            </TabsTrigger>
                            <TabsTrigger value="signup" className="text-black text-opacity-90 border-b-2 pb-2 data-[state=active]:border-purple-500 data-[state=active]:font-semibold transition-all duration-300">
                                SIGNUP
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent className="flex flex-col gap-5 mt-8" value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <Input
                                    placeholder="Email"
                                    type="email"
                                    className="rounded-full p-4"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Input
                                    placeholder="Password"
                                    type="password"
                                    className="rounded-full p-4"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <Button type="submit" className="rounded-full p-4 bg-purple-500 text-white">Login</Button>
                            </form>
                        </TabsContent>
                        <TabsContent className="flex flex-col gap-5 mt-2" value="signup">
                            <form onSubmit={handleSignup} className="space-y-4">
                                <Input
                                    placeholder="Username"
                                    type="text"
                                    className="rounded-full p-4"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <Input
                                    placeholder="Email"
                                    type="email"
                                    className="rounded-full p-4"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Input
                                    placeholder="Password"
                                    type="password"
                                    className="rounded-full p-4"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <Input
                                    placeholder="Confirm Password"
                                    type="password"
                                    className="rounded-full p-4"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <Button type="submit" className="rounded-full p-4 bg-purple-500 text-white">Signup</Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="hidden xl:flex items-center justify-center p-10 lg:p-20">
                    <img src={Background} alt="background" className="w-full h-auto rounded-3xl" />
                </div>
            </div>
        </div>
    );
}
