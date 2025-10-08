import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Plus, X, Save, AlertTriangle, CheckCircle, Info, Check } from "lucide-react"; 

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificationModal = ({ message, type, onClose }) => {
    let title, icon, buttonClass, iconClass;

    switch (type) {
        case 'success':
            title = "Sukses!";
            icon = <CheckCircle size={24} />;
            buttonClass = "bg-green-600 hover:bg-green-700";
            iconClass = "text-green-400";
            break;
        case 'info':
            title = "Informasi";
            icon = <Info size={24} />;
            buttonClass = "bg-blue-600 hover:bg-blue-700";
            iconClass = "text-blue-400";
            break;
        case 'error':
        default:
            title = "Peringatan/Error";
            icon = <AlertTriangle size={24} />;
            buttonClass = "bg-red-600 hover:bg-red-700";
            iconClass = "text-red-400";
            break;
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-2xl border border-gray-700">
            <div className={`flex items-center gap-3 mb-4 ${iconClass}`}>
              {icon}
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <p className="text-gray-300 mb-6 text-sm">{message}</p>
            <button
              onClick={onClose}
              className={`w-full py-2 ${buttonClass} text-white font-medium rounded-lg transition duration-200`}
            >
              Tutup
            </button>
          </div>
        </div>
    );
};


const StockOpname = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [stockOpnameData, setStockOpnameData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null); 
  const [isApproving, setIsApproving] = useState(false);


  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/stockopname", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });
      const fetchedProducts = response.data.products || [];
      setProducts(fetchedProducts);
      const initialStockOpname = fetchedProducts.map((p) => ({
        product: p._id,
        sku: p.skubrg, 
        name: p.name,
        systemStock: p.stock, 
        physicalStock: p.stock,
        difference: 0,
        note: "",
        opnameDate: new Date().toISOString().split("T")[0],
      }));
      setStockOpnameData(initialStockOpname);
    } catch (err) {
      console.error("Error fetching products:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Gagal mengambil data produk/inventaris.";
      setErrorModal(errorMessage);
    } finally {
        setLoading(false);
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("pos-token");
    if (!token) return;

    try {
      const response = await axios.get("http://localhost:3000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const userData = response.data.user; 

      if (userData && userData.name) {
          setCurrentUser(userData);
      } else {
          setCurrentUser(null);
          console.error("FAIL: Data user tidak mengandung properti 'name'.");
      }
      
    } catch (err) {
      console.error("Error fetching current user:", err.response || err);
      setCurrentUser(null);
    }
  }, []);


  useEffect(() => {
    fetchCurrentUser();
    fetchProducts();
  }, [fetchCurrentUser, fetchProducts]);


  const handleOpenOpname = () => {
    const resetStockOpname = products.map((p) => ({
      product: p._id,
      sku: p.skubrg,
      name: p.name,
      systemStock: p.stock,
      physicalStock: p.stock, 
      difference: 0,
      note: "",
      opnameDate: new Date().toISOString().split("T")[0],
    }));
    setStockOpnameData(resetStockOpname);
    setErrorModal(null); 
    setSuccessModal(null); 
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setIsSaving(false);
  };
  
  const handleChange = (index, name, value) => {
    setStockOpnameData((prev) => {
      const updatedData = [...prev];
      const item = updatedData[index];

      let newPhysicalStock = item.physicalStock;
      if (name === "physicalStock") {
          const parsedValue = parseInt(value);
          newPhysicalStock = isNaN(parsedValue) ? 0 : Math.max(0, parsedValue);
      }
      
      let newNote = name === "note" ? value : item.note;
      const systemStock = parseInt(item.systemStock) || 0;
      const difference = newPhysicalStock - systemStock;

      updatedData[index] = {
        ...item,
        physicalStock: newPhysicalStock,
        difference: difference,
        note: newNote,
      };
      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorModal(null);
    setSuccessModal(null);

    const itemsToSubmit = stockOpnameData
      .filter((item) => item.difference !== 0 || item.note.trim() !== "")
      .map((item) => ({
        product: item.product,
        systemStock: item.systemStock, 
        physicalStock: item.physicalStock,
        difference: item.difference,
        note: item.note,
        opnameDate: item.opnameDate,
      }));

    if (itemsToSubmit.length === 0) {
      setSuccessModal({ message: "Tidak ada perubahan stok yang dicatat atau selisih 0.", type: "info" });
      handleCloseModal();
      return;
    }
    
    try {
      const res = await axios.post(
        "http://localhost:3000/api/stockopname/batch",
        { opnameRecords: itemsToSubmit }, 
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
        }
      );

      if (res.data.success) {
        setSuccessModal({ message: res.data.message, type: "success" });
        setModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
        console.error("Save error:", err);
        const errorMessage = err.response?.data?.message || err.response?.data?.error || "Gagal menyimpan data Stock Opname. Operasi dibatalkan.";
        setErrorModal(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };


  const handleApprove = async (recordId, productName) => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'auditor')) {
        setErrorModal("Akses ditolak. Hanya Admin atau Auditor yang dapat menyetujui.");
        return;
    }

    if (!window.confirm(`Yakin ingin menyetujui Stock Opname untuk produk "${productName}"? Stok sistem akan diperbarui.`)) {
        return;
    }

    setIsApproving(true);
    setErrorModal(null);
    setSuccessModal(null);

    try {
        const res = await axios.put(
            `http://localhost:3000/api/stockopname/approve/${recordId}`,
            {},
            { headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` } }
        );

        if (res.data.success) {
            setSuccessModal({ message: res.data.message, type: "success" });
            fetchProducts();
        }
    } catch (err) {
        console.error("Approval error:", err);
        const errorMessage = err.response?.data?.message || "Gagal menyetujui Stock Opname. Pastikan catatan SO belum disetujui atau stok sistem tidak berubah.";
        setErrorModal(errorMessage);
    } finally {
        setIsApproving(false);
    }
  };
  

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200 font-sans">
      
      {errorModal && <NotificationModal message={errorModal} type="error" onClose={() => setErrorModal(null)} />}
      {successModal && <NotificationModal message={successModal.message} type={successModal.type} onClose={() => setSuccessModal(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-extrabold text-blue-400">Stock Opname</h1>
        <button
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition duration-200 disabled:bg-gray-600"
          onClick={handleOpenOpname}
          disabled={loading || isApproving}
        >
          <Plus size={20} /> Mulai Opname Baru
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-gray-300">Data Perbandingan Stok</h2>
      
      <div className="bg-gray-800 rounded-xl shadow-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-gray-200 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left w-12">No</th>
              <th className="px-4 py-3 text-left">SKU</th>
              <th className="px-4 py-3 text-left">Nama Produk</th>
              <th className="px-4 py-3 text-right">Stok Sistem</th>
              <th className="px-4 py-3 text-right text-yellow-300">Stok Fisik Terakhir</th> 
              <th className="px-4 py-3 text-center text-yellow-300">Status SO Terakhir</th>
              <th className="px-4 py-3 text-left text-yellow-300">Tanggal Opname Terakhir</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
                <tr><td colSpan="8" className="text-center py-8 text-blue-400">Memuat data inventaris...</td></tr>
            ) : (
                products.map((product, index) => (
                    <tr 
                        key={product._id} 
                        className={
                            product.lastOpname && 
                            !product.lastOpname.isApproved && 
                            product.lastOpname.stokAktual !== product.stock
                            ? "bg-red-900/10 hover:bg-red-900/20 border-l-4 border-red-500/80" 
                            : "hover:bg-gray-700/50 transition duration-150"
                        }
                    > 
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3 font-mono text-yellow-300">{product.skubrg || 'N/A'}</td>
                        <td className="px-4 py-3 font-medium">{product.name}</td>
                        <td className="px-4 py-3 text-right font-bold text-lg">{product.stock}</td>
                        
                        <td className="px-4 py-3 text-right font-semibold text-white">
                            {product.lastOpname ? product.lastOpname.stokAktual : '-'}
                        </td>

                        <td className="px-4 py-3 text-center text-xs">
                            {product.lastOpname ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    product.lastOpname.isApproved 
                                        ? 'bg-green-600/30 text-green-400' 
                                        : 'bg-yellow-600/30 text-yellow-400'
                                }`}>
                                    {product.lastOpname.isApproved ? 'APPROVED' : 'PENDING'}
                                </span>
                            ) : (
                                <span className="text-gray-500">N/A</span>
                            )}
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-400">
                            {product.lastOpname ? formatDate(product.lastOpname.opnameDate) : 'Belum pernah opname'}
                        </td>

                        {/* Kolom Aksi (Approval) */}
                        <td className="px-4 py-3 text-center">
                            {product.lastOpname && 
                            !product.lastOpname.isApproved && 
                            product.lastOpname.stokAktual !== product.stock &&
                            currentUser && 
                            (currentUser.role === 'admin' || currentUser.role === 'auditor') ? (
                                <button
                                    onClick={() => handleApprove(product.lastOpname._id, product.name)}
                                    className="flex items-center gap-1 mx-auto px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg text-xs transition duration-200 disabled:bg-gray-600"
                                    disabled={isApproving}
                                >
                                    {isApproving ? '...' : <Check size={14} />} Approve
                                </button>
                            ) : (
                                <span className="text-gray-600">-</span>
                            )}
                        </td>
                    </tr>
                ))
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-400">
                  Tidak ada produk ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modal Stock Opname --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-8 w-full max-w-5xl shadow-2xl relative max-h-[95vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer p-2 rounded-full hover:bg-gray-700"
              onClick={handleCloseModal}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-2 text-blue-400">Form Stock Opname Massal (Batch)</h2>
            <div className="text-sm text-gray-400 mb-6 flex justify-between">
              <p>Tanggal Opname: <span className="font-medium text-white">{stockOpnameData[0]?.opnameDate || new Date().toISOString().split("T")[0]}</span></p>
              <p>User Pelaksana: <span className="font-medium text-white">
                {currentUser?.name || "Memuat..."}
              </span></p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="bg-gray-700 rounded-xl shadow overflow-x-auto max-h-[60vh] overflow-y-scroll mb-6 border border-gray-600">
                <table className="w-full text-sm">
                  <thead className="bg-gray-600 text-gray-200 sticky top-0 shadow-md">
                    <tr>
                      <th className="px-4 py-3 text-left w-12">No</th>
                      <th className="px-4 py-3 text-left w-20">SKU</th>
                      <th className="px-4 py-3 text-left">Nama Produk</th>
                      <th className="px-4 py-3 text-right">Stok Sistem</th>
                      <th className="px-4 py-3 text-center w-[150px]">Stok Fisik (Input)</th>
                      <th className="px-4 py-3 text-right w-20">Selisih</th>
                      <th className="px-4 py-3 text-left w-[250px]">Catatan (Alasan Selisih)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {stockOpnameData.map((item, index) => (
                      <tr 
                        key={item.product}
                        className={
                          item.difference !== 0
                            ? item.difference > 0
                              ? "bg-green-900/40 hover:bg-green-900/60" 
                              : "bg-red-900/40 hover:bg-red-900/60" 
                            : "hover:bg-gray-700"
                        }
                      > 
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs">{item.sku}</td>
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-right">{item.systemStock}</td>
                        <td className="px-2 py-1">
                          <input
                            type="number"
                            name="physicalStock"
                            value={item.physicalStock}
                            onChange={(e) => handleChange(index, "physicalStock", e.target.value)}
                            className="w-full px-2 py-1 bg-gray-900 border border-gray-600 focus:border-blue-500 rounded-lg text-center appearance-none"
                            placeholder="Stok Fisik" 
                            min="0"
                            required
                          />
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-bold ${
                            item.difference > 0
                              ? "text-green-400"
                              : item.difference < 0
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                        >
                          {item.difference}
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="text"
                            name="note"
                            value={item.note}
                            onChange={(e) => handleChange(index, "note", e.target.value)}
                            placeholder="Opsional: Alasan selisih"
                            className="w-full px-2 py-1 bg-gray-900 border border-gray-600 focus:border-blue-500 rounded-lg text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <p className="text-sm text-yellow-500 mb-4">
                  *Hanya produk dengan **selisih** atau **catatan** yang akan disimpan ke database. Stok produk di sistem tidak diubah.
              </p>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-xl cursor-pointer transition duration-200"
                  disabled={isSaving}
                >
                  Batal & Tutup
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg transition duration-200 disabled:bg-green-800"
                  disabled={isSaving}
                >
                  {isSaving ? (
                      <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Menyimpan...
                      </>
                  ) : (
                      <><Save size={18} /> Simpan Batch Opname</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockOpname;