import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import ArticlePanel from './ArticlePanel'
import "../css/articleStyle.css"


export default function Article() {
    const { id } = useParams();

    const[content, setContent] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/get_article/' + id);
                const data = await response.json();
                setContent(data)
            } catch (error) {
                console.error('Error:', error);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="page-content">
            <h1 className="headline"> Hello (this is page-specific CSS) </h1>
            <div className="articleContent">
                <p dangerouslySetInnerHTML={{ __html: content.htmlChanges }}></p>
            </div>
        </div>
    )
};