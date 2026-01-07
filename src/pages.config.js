import Captions from './pages/Captions';
import History from './pages/History';
import Home from './pages/Home';
import Subtitles from './pages/Subtitles';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Captions": Captions,
    "History": History,
    "Home": Home,
    "Subtitles": Subtitles,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};