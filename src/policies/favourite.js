const ApplicationPolicy = require("./application");

module.exports = class FavouritePolicy extends ApplicationPolicy {
    destroy(){
        return this._isOwner();
    }
}