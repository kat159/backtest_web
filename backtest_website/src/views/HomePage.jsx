import React, { useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom';
import Content from '../components/layout/content/Content';
import Footer from '../components/layout/footer/Footer';
import Header from '../components/layout/header/Header';

export default function HomePage() {

    const nav = useNavigate();


    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            nav('/login', {replace: true});
        }
    })

    return (
        <div>
            <Header />
            <Content />
            <Footer />
        </div>
    )
}
