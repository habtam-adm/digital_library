import axios from "axios";


const API_URL = "http://localhost:5000/api/books";

export const getBooks = () => axios.get(API_URL);

export const addBook = (bookData) => axios.post(API_URL, bookData);

export const deleteBook = (id) => axios.delete(`${API_URL}/${id}`);


export const updateBook = (id, data) => axios.put(`${API_URL}/${id}`, data);