const Sauce = require('../models/sauces');
const User = require('../models/user')
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    req.body.sauce = JSON.parse(req.body.sauce);
    const url = req.protocol + '://' + req.get('host');
    const sauce = new Sauce({
        name: req.body.sauce.name,
        manufacturer: req.body.sauce.manufacturer,
        description: req.body.sauce.description,
        mainPepper: req.body.sauce.mainPepper,
        imageUrl: url + '/images/' + req.file.filename,
        heat: req.body.sauce.heat,
        likes: '0',
        dislikes: '0',
        userId: req.body.sauce.userId,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save().then(
        () => {
            res.status(201).json({
                message: 'Sauce saved successfully!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifySauce = (req, res, next) => {
    let sauce = new Sauce({ _id: req.params._id })
    if (req.file) {
        Sauce.findOne({ _id: req.params.id }).then(
            (sauce) => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlinkSync('images/' + filename);
            }
        ).catch(
            (error) => {
                res.status(404).json({
                    error: error
                });
            }
        );
        req.body.sauce = JSON.parse(req.body.sauce);
        const url = req.protocol + '://' + req.get('host');
        sauce = {
            _id: req.params.id,
            name: req.body.sauce.name,
            manufacturer: req.body.sauce.manufacturer,
            description: req.body.sauce.description,
            mainPepper: req.body.sauce.mainPepper,
            imageUrl: url + '/images/' + req.file.filename,
            heat: req.body.sauce.heat,
        };
    } else {
        sauce = {
            _id: req.params.id,
            name: req.body.name,
            manufacturer: req.body.manufacturer,
            description: req.body.description,
            mainPepper: req.body.mainPepper,
            heat: req.body.heat,
        };
    }
    Sauce.updateOne({ _id: req.params.id }, sauce).then(
        () => {
            res.status(201).json({
                message: 'Sauce updated successfully!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }).then(
        (sauce) => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink('images/' + filename, () => {
                Sauce.deleteOne({ _id: req.params.id }).then(
                    () => {
                        res.status(200).json({
                            message: 'Sauce Deleted!'
                        });
                    }
                ).catch(
                    (error) => {
                        res.status(400).json({
                            error: error
                        });
                    }
                );
            });
        }
    )
};

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }).then(
        (sauce) => {
            if (sauce.usersLiked.includes(req.body.userId)) {
                const arrayIndex = sauce.usersLiked.indexOf(req.body.userId);
                sauce.usersLiked.splice(arrayIndex, 1);
                sauce.likes--;
                sauce.save({ _id: req.params.id }).then(
                    () => {
                        res.status(201).json({
                            message: 'Like saved successfully!'
                        });
                    }
                ).catch(
                    (error) => {
                        res.status(400).json({
                            error: error
                        });
                    }
                );
            } else if (sauce.usersDisliked.includes(req.body.userId)) {
                const arrayIndex = sauce.usersDisliked.indexOf(req.body.userId);
                sauce.usersDisliked.splice(arrayIndex, 1);
                sauce.dislikes--;
                sauce.save({ _id: req.params.id }).then(
                    () => {
                        res.status(201).json({
                            message: 'Like saved successfully!'
                        });
                    }
                ).catch(
                    (error) => {
                        res.status(400).json({
                            error: error
                        });
                    }
                );
            } else {
                if (req.body.like === -1) {
                    const arrayIndex = sauce.usersLiked.indexOf(req.body.userId);
                    sauce.usersDisliked.splice(arrayIndex, 1);
                    sauce.dislikes++;
                    sauce.usersDisliked.push(req.body.userId);
                } else if (req.body.like === 1) {
                    const arrayIndex = sauce.usersDisliked.indexOf(req.body.userId);
                    sauce.usersDisliked.splice(arrayIndex, 1);
                    sauce.likes++;
                    sauce.usersLiked.push(req.body.userId);
                }
                sauce.save({ _id: req.params.id }).then(
                    () => {
                        res.status(201).json({
                            message: 'Like saved successfully!'
                        });
                    }
                ).catch(
                    (error) => {
                        res.status(400).json({
                            error: error
                        });
                    }
                );
            }
        }
    )
}