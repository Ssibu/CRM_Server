// import models from '../../models/index.js'; 

// const { Menu, SubMenu, SubSubMenu } = models

// export const getNavigationTree = async (req, res) => {
//   try {
//     const navigationTree = await Menu.findAll({
//       attributes: ['id', 'en_title', 'od_title', 'slug', 'display_order', 'link'],
//       where: { status: 'Active' },
//       order: [['display_order', 'ASC']],
//       include: [
//         {
//           model: SubMenu,
//           as: 'SubMenus',
//           required: false,
//           where: { status: 'Active' },
//           attributes: ['id', 'en_title', 'od_title', 'slug', 'display_order', 'link'],
//           order: [['display_order', 'ASC']],
//           include: [
//             {
//               model: SubSubMenu,
//               as: 'SubSubMenus',
//               required: false,
//               where: { status: 'Active' },
//               attributes: ['id', 'en_title', 'od_title', 'slug', 'display_order', 'link'],
//               order: [['display_order', 'ASC']],
//             },
//           ],
//         },
//       ],
//     });

//     navigationTree.forEach(menu => {
//       if (menu.SubMenus && menu.SubMenus.length > 0) {
//         menu.SubMenus.sort((a, b) => a.display_order - b.display_order);

//         menu.SubMenus.forEach(subMenu => {
//           if (subMenu.SubSubMenus && subMenu.SubSubMenus.length > 0) {
//             subMenu.SubSubMenus.sort((a, b) => a.display_order - b.display_order);
//           }
//         });
//       }
//     });

//     res.status(200).json(navigationTree);
//   } catch (error) {
//     console.error('Error fetching navigation tree:', error);
//     res.status(500).json({ message: 'Failed to fetch navigation data.' });
//   }
// };


import models from '../../models/index.js';

const { Menu, SubMenu, SubSubMenu, HomeSetting } = models;

export const getNavigationTree = async (req, res) => {
  try {
    const [navigationTree, settings] = await Promise.all([
      Menu.findAll({
        attributes: ['id', 'en_title', 'od_title', 'slug', 'display_order', 'link'],
        where: { status: 'Active' },
        order: [['display_order', 'ASC']],
        include: [
          {
            model: SubMenu,
            as: 'SubMenus',
            required: false,
            where: { status: 'Active' },
            attributes: ['id', 'en_title', 'od_title', 'slug', 'display_order', 'link'],
            order: [['display_order', 'ASC']],
            include: [
              {
                model: SubSubMenu,
                as: 'SubSubMenus',
                required: false,
                where: { status: 'Active' },
                attributes: ['id', 'en_title', 'od_title', 'slug', 'display_order', 'link'],
                order: [['display_order', 'ASC']],
              },
            ],
          },
        ],
      }),
      HomeSetting.findOne({
        attributes: ['showInnerpageSidebar', 'showChatbot'] // Only fetch what's needed
      })
    ]);

    // Note: The sorting logic you had is already handled by `order` in the Sequelize query.
    // The extra sorting loops are redundant unless you have a specific reason for them.

    // Combine the results into a single response object
    res.status(200).json({
      navigation: navigationTree,
      settings: settings || { showInnerpageSidebar: true, showChatbot: true } // Provide defaults if no settings found
    });

  } catch (error) {
    console.error('Error fetching navigation data:', error);
    res.status(500).json({ message: 'Failed to fetch navigation data.' });
  }
};