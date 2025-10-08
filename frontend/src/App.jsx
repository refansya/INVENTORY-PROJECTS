import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router'
import Root from './utils/Root'
import Login from './pages/Login'
import ProtectedRoutes from './utils/ProtectedRoutes'
import Dashboard from './pages/Dashboard'
import Categories from './components/Categories'
import Suppliers from './components/Suppliers'
import Products from './components/Products'
import BarangIn from './components/BarangIn'
import BarangOut from './components/BarangOut'
import Users from './components/Users'
import Profiles from './components/Profiles'
import StockOpname from './components/StockOpname'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Root/>} />
        <Route path="/admin-dashboard" element={<ProtectedRoutes requireRole={["admin"]}>  
          <Dashboard />
        </ProtectedRoutes>} 
        >
        <Route 
        index
        element={<h1>Summary of dashboard</h1>}
          />
        <Route 
          path='categories'
          element={<Categories />}
        />
        <Route 
          path='products'
          element={<Products />}
        />
        <Route 
          path='suppliers'
          element={<Suppliers />}
        />
       <Route 
          path='BarangIn'
          element={<BarangIn/>}
        />
        <Route 
          path='BarangOut'
          element={<BarangOut/>}
        />
        <Route 
          path='Users'
          element={<Users />}
        />
        <Route 
          path='profile'
          element={<Profiles />}
        />
        <Route 
          path='StockOpname'
          element={<StockOpname />}
        />



        </Route>

        <Route path="customer/dashboard" element={<h1>Customer Dashboard</h1>} />
        <Route path="/login" element={<Login />}/>
        <Route path="/unauthorized" element={<p className='font-bold text-3xl mt-20 ml-20'>Unauthorized</p>}/>
      </Routes>
    </Router>   
  )
}

export default App
