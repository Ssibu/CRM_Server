// import { DataTypes } from 'sequelize';
// import sequelize from '../../config/db.js'; 

// const HomeSetting = sequelize.define('HomeSetting', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   en_org_name: { type: DataTypes.TEXT, allowNull: true },
//   od_org_name: { type: DataTypes.TEXT, allowNull: true },
//   en_person_designation: { type: DataTypes.TEXT, allowNull: true },
//   od_person_designation: { type: DataTypes.TEXT, allowNull: true },
//   en_person_name: { type: DataTypes.TEXT, allowNull: true },
//   od_person_name: { type: DataTypes.TEXT, allowNull: true },
//   en_overview_description: { type: DataTypes.TEXT, allowNull: true },
//   od_overview_description: { type: DataTypes.TEXT, allowNull: true },
//   en_address: { type: DataTypes.TEXT, allowNull: true },
//   od_address: { type: DataTypes.TEXT, allowNull: true },
//   email: { type: DataTypes.STRING, allowNull: true },
//   mobileNumber: { type: DataTypes.STRING, allowNull: true },
//   facebookLink: { type: DataTypes.STRING, allowNull: true },
//   twitterLink: { type: DataTypes.STRING, allowNull: true },
//   instagramLink: { type: DataTypes.STRING, allowNull: true },
//   linkedinLink: { type: DataTypes.STRING, allowNull: true },
//   odishaLogo: { type: DataTypes.STRING, allowNull: true },
//   cmPhoto: { type: DataTypes.STRING, allowNull: true },   
//   showInnerpageSidebar: { type: DataTypes.BOOLEAN, defaultValue: true },
//   showChatbot: { type: DataTypes.BOOLEAN, defaultValue: true },
// }, {
//   tableName: 'home_settings',
//   timestamps: true,
// });




// export default HomeSetting;

import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js'; 

const HomeSetting = sequelize.define('HomeSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  en_org_name: { 
    type: DataTypes.STRING(100), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'English Organization Name must be less than or equal to 100 characters'
      }
    }
  },
  od_org_name: { 
    type: DataTypes.STRING(100), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Odia Organization Name must be less than or equal to 100 characters'
      }
    }
  },
  en_person_designation: { 
    type: DataTypes.STRING(55), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 55],
        msg: 'English Person Designation must be less than or equal to 55 characters'
      }
    }
  },
  od_person_designation: { 
    type: DataTypes.STRING(55), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 55],
        msg: 'Odia Person Designation must be less than or equal to 55 characters'
      }
    }
  },
  en_person_name: { 
    type: DataTypes.STRING(100), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'English Person Name must be less than or equal to 100 characters'
      }
    }
  },
  od_person_name: { 
    type: DataTypes.STRING(100), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Odia Person Name must be less than or equal to 100 characters'
      }
    }
  },
  en_overview_description: { 
    type: DataTypes.STRING(2000), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 2000],
        msg: 'English Overview Description must be less than or equal to 2000 characters'
      }
    }
  },
  od_overview_description: { 
    type: DataTypes.STRING(2000), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 2000],
        msg: 'Odia Overview Description must be less than or equal to 2000 characters'
      }
    }
  },
  en_address: { 
    type: DataTypes.STRING(255), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 255],
        msg: 'English Address must be less than or equal to 255 characters'
      }
    }
  },
  od_address: { 
    type: DataTypes.STRING(255), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 255],
        msg: 'Odia Address must be less than or equal to 255 characters'
      }
    }
  },
  email: { 
    type: DataTypes.STRING(100), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Email must be less than or equal to 100 characters'
      },
      isEmail: {
        msg: 'Please provide a valid email address'
      }
    }
  },
  mobileNumber: { 
    type: DataTypes.STRING(10), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 10],
        msg: 'Mobile Number must be less than or equal to 10 characters'
      }
    }
  },
  facebookLink: { 
    type: DataTypes.STRING(100), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Facebook Link must be less than or equal to 100 characters'
      },
      isUrl: {
        msg: 'Please provide a valid URL for Facebook'
      }
    }
  },
  twitterLink: { 
    type: DataTypes.STRING(100), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Twitter Link must be less than or equal to 100 characters'
      },
      isUrl: {
        msg: 'Please provide a valid URL for Twitter'
      }
    }
  },
  instagramLink: { 
    type: DataTypes.STRING(100), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Instagram Link must be less than or equal to 100 characters'
      },
      isUrl: {
        msg: 'Please provide a valid URL for Instagram'
      }
    }
  },
  linkedinLink: { 
    type: DataTypes.STRING(100), 
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'LinkedIn Link must be less than or equal to 100 characters'
      },
      isUrl: {
        msg: 'Please provide a valid URL for LinkedIn'
      }
    }
  },
  odishaLogo: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  cmPhoto: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },   
  showInnerpageSidebar: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  },
  showChatbot: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  },
}, {
  tableName: 'home_settings',
  timestamps: true,
});

export default HomeSetting;