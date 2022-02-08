function join(criterion) {
    const newC = []
    for (const criteria of criterion) {
        // console.log('criteria:' + criteria)
        newC.push(criteria.join(''))
    }
    return newC
}

const toPython = (strategy) => {
    // console.log(strategy);
    const {openCriterion, closeCriterion} = strategy
    strategy.openCriterion = join(openCriterion);
    strategy.closeCriterion = join(closeCriterion);
    return strategy
}

module.exports.toStrategyFile = toPython