import { Op } from 'sequelize';
import models from '../../models/index.js';

const { Menu, SubMenu, SubSubMenu, NewsAndEvent, Tender } = models;

const generateUrl = (item, type) => {
  switch (type) {
    case 'Page':
      return `/page/${item.slug}`;
    case 'SubPage':
      return `/subpage/${item.slug}`;
    case 'SubSubPage':
      return `/sub-subpage/${item.slug}`;
    default:
      return '/';
  }
};

export const siteSearch = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  const searchQuery = { [Op.like]: `%${q}%` };

  try {
    const [menus, subMenus, subSubMenus, news, tender] = await Promise.all([
      Menu.findAll({ where: { en_title: searchQuery }, attributes: ['id', 'en_title', 'slug'] }),
      SubMenu.findAll({ where: { en_title: searchQuery }, attributes: ['id', 'en_title', 'slug'] }),
      SubSubMenu.findAll({ where: { en_title: searchQuery }, attributes: ['id', 'en_title', 'slug'] }),
      NewsAndEvent.findAll({ where: { en_title: searchQuery }, attributes: ['id', 'en_title'] }),
         Tender.findAll({ where: { en_title: searchQuery }, attributes: ['id', 'en_title'] })
    ]);

    // Map results to a consistent format
    const formattedMenus = menus.map(item => ({
      id: `menu-${item.id}`,
      title: item.en_title,
      url: generateUrl(item, 'Page'),
      type: 'Page'
    }));

    const formattedSubMenus = subMenus.map(item => ({
      id: `submenu-${item.id}`,
      title: item.en_title,
      url: generateUrl(item, 'SubPage'),
      type: 'Page'
    }));

    const formattedSubSubMenus = subSubMenus.map(item => ({
      id: `subsubmenu-${item.id}`,
      title: item.en_title,
      url: generateUrl(item, 'SubSubPage'),
      type: 'Page'
    }));
    
    const formattedNews = news.map(item => ({
      id: `news-${item.id}`,
      title: item.en_title,
      url: "/subpage/news-events",
      type: 'News & Event'
    }));

     const formattedTender = tender.map(item => ({
      id: `tender-${item.id}`,
      title: item.en_title,
      url: "/subpage/tenders",
      type: 'Tender'
    }));

    const allResults = [...formattedMenus, ...formattedSubMenus, ...formattedSubSubMenus, ...formattedNews, ...formattedTender];

    res.status(200).json(allResults);
  } catch (error) {
    console.error('Error during site search:', error);
    res.status(500).json({ message: 'Failed to perform search.' });
  }
};