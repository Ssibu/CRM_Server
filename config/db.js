import { Sequelize } from "sequelize";

//database connection
const sequelize=new Sequelize('crm_02','root','',{
    host:'localhost',
    dialect:'mysql',
    logging:false,
})

export default sequelize;