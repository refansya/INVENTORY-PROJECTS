import CategoryModel from '../models/Category.js';

const addCategory = async (req, res) => {
  try {
    const { categoryName, categoryDescription } = req.body;

    const existingCategory = await CategoryModel.findOne({ categoryName });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: 'Category already exists' });
    }

    const newCategory = new CategoryModel({
      categoryName,
      categoryDescription,
    });

    await newCategory.save();
    return res
      .status(201)
      .json({ success: true, message: 'Category added successfully' });
  } catch (error) {
    console.error('Error adding category:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error in getting category' });
  }
}

const updateCategory = async (req, res) => {
  try {
    const {id} = req.params;
    const {categoryName, categoryDescription} = req.body;

    const existingCategory = await CategoryModel.findById(id);
    if(!existingCategory) {
      return res.status(404).json({success: false, message: 'Category not found'});
    }

    const updateCategory = await CategoryModel.findByIdAndUpdate(
      id,
      {categoryName, categoryDescription},
      {new: true}
    );
    return res.status(200).json({success: true, message: 'category updated successfully'});
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({success: false, message: 'server error'});
  }
}

const deleteCategory = async (req,res) => {
  try {
    const {id} = req.params;

    const existingCategory = await CategoryModel.findById(id);
    if(!existingCategory){
      return res.status(404).json({ success : false, message: 'Category not found'});
    }

    await CategoryModel.findByIdAndDelete(id);
    return res.status(200).json({success: true, message: 'Category deleted successfully'});
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({success: false, message: 'server error'});
  }
}

export { addCategory, getCategories, updateCategory, deleteCategory };
