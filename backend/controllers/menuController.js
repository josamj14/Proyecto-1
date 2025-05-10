const { getRepository } = require("../repositories/respositoryFactory");
const menuRepo = getRepository("menu");
  
  // Respuesta estandarizada
  const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
      status,
      message,
      data,
    });
  };
  
  // Crear un menú
  const createMenu = async (req, res, next) => {
    const { name } = req.body;
    try {
      await menuRepo.create(name);
      handleResponse(res, 201, "Menu created successfully");
    } catch (err) {
      next(err);
    }
  };
  
  // Obtener todos los menús
  const getAllMenus = async (req, res, next) => {
    try {
      const menus = await menuRepo.findAll();
      handleResponse(res, 200, "Menus fetched successfully", menus);
    } catch (err) {
      next(err);
    }
  };
  
  // Obtener un menú por ID
  const getMenuById = async (req, res, next) => {
    try {
      const menu = await menuRepo.findById(req.params.id);
      if (!menu) return handleResponse(res, 404, "Menu not found");
      handleResponse(res, 200, "Menu fetched successfully", menu);
    } catch (err) {
      next(err);
    }
  };
  
  // Actualizar un menú
  const updateMenu = async (req, res, next) => {
    const { name } = req.body;
    try {
      const updatedMenu = await menuRepo.update(req.params.id, name);
      if (!updatedMenu) return handleResponse(res, 404, "Menu not found");
      handleResponse(res, 200, "Menu updated successfully", updatedMenu);
    } catch (err) {
      next(err);
    }
  };
  
  // Eliminar un menú
  const deleteMenu = async (req, res, next) => {
    try {
      const deletedMenu = await menuRepo.remove(req.params.id);
      if (!deletedMenu) return handleResponse(res, 404, "Menu not found");
      handleResponse(res, 200, "Menu deleted successfully");
    } catch (err) {
      next(err);
    }
  };
  
  module.exports = {
    createMenu,
    getAllMenus,
    getMenuById,
    updateMenu,
    deleteMenu,
  };
  