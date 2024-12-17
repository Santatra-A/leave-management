import { Trash } from 'lucide-react'
import { Button } from '../ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'

interface DeleteConfirmationProps {
    element: string
    handleDelete: () => void
}

const DeleteConfirmation = ({ element, handleDelete }: DeleteConfirmationProps) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive" size="icon" title="Delete" className="rounded-full">
                    <Trash className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure you want to delete this {element}?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the element and remove its data from our servers.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteConfirmation
