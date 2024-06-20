import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';


export default function Article() {
    const { id } = useParams();

    const[content, setContent] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/get_article/' + id);
                const data = await response.json();
                setContent(data)
                console.log(data)
            } catch (error) {
                console.error('Error:', error);
            }
        }
        fetchData();
    }, []);

    return (
        <div>
            <h1>{content.articleText}</h1>
            <h2>{content.editedText}</h2>
        </div>
    )
};