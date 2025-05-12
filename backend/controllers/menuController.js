const { getRepository } = require("../repositories/respositoryFactory");

const { client: redisClient, getPrefixedKey } = require("../db/redisClient");

  // Respuesta estandarizada
  const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
      status,
      message,
      data,
    });
  };
  
  const getAllMenus = async (req, res, next) => {
    try {
      const menuRepo = getRepository("menu");
      const menus = await menuRepo.findAll();
      handleResponse(res, 200, "Menus fetched successfully", menus);
  
      // 🔄 Guardar en Redis
      const cacheKey = getPrefixedKey("all_menus");
      await redisClient.set(cacheKey, JSON.stringify(menus), {
        EX: 60 * 60, // Expira en 1 hora
      });
    } catch (err) {
      next(err);
    }
  };
  
  const getMenuById = async (req, res, next) => {
    try {
      const menuRepo = getRepository("menu");
      const menu = await menuRepo.findById(req.params.id);
      if (!menu) return handleResponse(res, 404, "Menu not found");
  
      handleResponse(res, 200, "Menu fetched successfully", menu);
  
      // Guardar en Redis
      const cacheKey = getPrefixedKey(`menu:${req.params.id}`);
      await redisClient.set(cacheKey, JSON.stringify(menu), {
        EX: 60 * 60,
      });
    } catch (err) {
      next(err);
    }
  };
  
  

  // Crear un menú
  const createMenu = async (req, res, next) => {
    const { name } = req.body;
    try {
      const menuRepo = getRepository("menu");
      await menuRepo.create(name);
      handleResponse(res, 201, "Menu created successfully");
    } catch (err) {
      next(err);
    }
  };
  
  // Actualizar un menú
  const updateMenu = async (req, res, next) => {
    const { name } = req.body;
    try {
      const menuRepo = getRepository("menu");
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
      const menuRepo = getRepository("menu");
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
  