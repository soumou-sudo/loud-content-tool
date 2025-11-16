import Home from './pages/Home';
import Subtitles from './pages/Subtitles';
import Captions from './pages/Captions';
import History from './pages/History';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Subtitles": Subtitles,
    "Captions": Captions,
    "History": History,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};