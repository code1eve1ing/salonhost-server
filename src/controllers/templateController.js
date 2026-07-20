const Template = require("../models/Template");

/**
 * @desc    Get paginated list of templates
 * @route   GET /api/v1/templates
 * @query   page (default 1), limit (default 10, max 50), tag (optional filter)
 * @access  Public
 */
async function getTemplates(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const filter = { is_active: true };
  if (req.query.tag) {
    filter.tag = req.query.tag;
  }

  const [templates, total] = await Promise.all([
    Template.find(filter)
      .sort({ sort_order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Template.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  const data = templates.map((t) => ({
    id: t._id,
    name: t.name,
    tag: t.tag,
    image_urls: t.image_urls,
    is_premium: t.is_premium,
  }));

  res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
}

/**
 * @desc    Get single template by id
 * @route   GET /api/v1/templates/:id
 * @access  Public
 */
async function getTemplateById(req, res) {
  const template = await Template.findOne({
    _id: req.params.id,
    is_active: true,
  }).lean();

  if (!template) {
    return res.status(404).json({ success: false, message: "Template not found" });
  }

  res.status(200).json({
    success: true,
    data: {
      id: template._id,
      name: template.name,
      tag: template.tag,
      description: template.description,
      image_urls: template.image_urls,
      is_premium: template.is_premium,
    },
  });
}

/**
 * @desc    Create a new template
 * @route   POST /api/v1/templates
 * @access  Private (add auth middleware in production)
 */
async function createTemplate(req, res) {
  const { name, tag, description, image_urls, is_premium, sort_order } = req.body;

  const template = await Template.create({
    name,
    tag,
    description,
    image_urls,
    is_premium,
    sort_order,
  });

  res.status(201).json({
    success: true,
    data: template.toPublicJSON(),
  });
}

/**
 * @desc    Update a template
 * @route   PUT /api/v1/templates/:id
 * @access  Private
 */
async function updateTemplate(req, res) {
  const template = await Template.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!template) {
    return res.status(404).json({ success: false, message: "Template not found" });
  }

  res.status(200).json({ success: true, data: template.toPublicJSON() });
}

/**
 * @desc    Soft-delete a template (sets is_active false)
 * @route   DELETE /api/v1/templates/:id
 * @access  Private
 */
async function deleteTemplate(req, res) {
  const template = await Template.findByIdAndUpdate(
    req.params.id,
    { is_active: false },
    { new: true }
  );

  if (!template) {
    return res.status(404).json({ success: false, message: "Template not found" });
  }

  res.status(200).json({ success: true, message: "Template deleted" });
}

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
