import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import processList from './_MOCK_/process'
import { Button } from '@mui/material'
import { Box } from '@mui/system'

/**
 * @param {Object[]} process
 * @param {string} process.id
 * @param {number} process.arrivalTime
 * @param {number} process.burstTime
 */
const calculateRatio = (process) => {
  let newProcess = []

  process.map(p => {
    const jwp = p.arrivalTime / process.length
    const ratio = (p.burstTime / jwp).toFixed(2)

    newProcess.push({
      id: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      jwp,
      ratio
    })
  })

  return newProcess.sort((a, b) => parseFloat(a.ratio) - parseFloat(b.ratio))
}


const useRunTask = (task, simSpeed = 1000) => {

  const formattedTask = task.map(t => ({
    ...t,
    remainingBurstTime: t.burstTime,
    completePercentage: 0,
    waitingTime: 0
  }))


  const [currentQueue, setCurrentQueue] = useState(0)
  const [runningTask, setRunningTask] = useState(formattedTask)

  const [isDone, setIsDone] = useState(false)
  const [waitTime, setWaitTime] = useState(0)

  const [isPaused, setPause] = useState(true)

  const pause = (p) => {
    if (isDone) {
      return
    }

    setPause(p)

  }

  useEffect(() => {

    if (isPaused) {
      return
    }

    const interval = setInterval(() => {
      if (runningTask[currentQueue].remainingBurstTime > 0) {
        runningTask.map((t, i) => {
          if (i === currentQueue) {
            runningTask[i].remainingBurstTime--
            setRunningTask([
              ...runningTask.slice(0, i),
              Object.assign({}, {
                ...runningTask[i],
                ratio: (runningTask[i].remainingBurstTime / runningTask[i].jwp).toFixed(2),
                completePercentage: Math.round((runningTask[i].burstTime - runningTask[i].remainingBurstTime) / runningTask[i].burstTime * 100),
              }),
              ...runningTask.slice(i + 1)
            ])
          }
        })
      } else {
        if (currentQueue >= task.length - 1) {
          setIsDone(true)
          setPause(true)
          return
        }

        setCurrentQueue(currentQueue + 1)
      }
    }, simSpeed)

    return () => clearInterval(interval)
  }, [currentQueue, isPaused])


  return [setPause, isDone, currentQueue, runningTask, isPaused]
}



function App() {

  const initialState = calculateRatio(processList)

  const [isRunning, setRunning] = useState(false)

  const process = [...initialState]
  const [setPause, isDone, current, task, isPaused] = useRunTask(process, 100)


  return (
    <div className="App">
      <Box>
        Initial Count
        <br></br>
        <br></br>
        {JSON.stringify(process)}
      </Box>
      <br></br>
      <Box>
        CurrentQ:
        {
          process[current].id
        }
        <br></br>
        {JSON.stringify(isPaused)}
        {JSON.stringify(task)}
      </Box>

      <Button variant={'contained'} onClick={() => {
        setRunning(!isRunning)
        setPause(isRunning)
      }}>
        {isRunning ? 'STOP' : 'START'}
      </Button>
    </div>
  )
}

export default App
