import { Sequelize } from "sequelize";

//database connection
const sequelize=new Sequelize('crm_01','root','',{
    host:'localhost',
    dialect:'mysql',
    logging:false,
})

export default sequelize;