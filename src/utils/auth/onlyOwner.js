import User from "../../services/user/schema.js"

const onlyOwner = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (user.user._id.toString() !== req.user._id.toString()) {
        res.status(403).send({ "message": "You are not the owner of this blog post!" })
        return
    } else {
        req.user = user
        next()
    }
}

export default onlyOwner