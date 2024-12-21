import { AlertDialog, AlertDialogContent, AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

export function NocationOff({
  showConfirmDialog,
  setShowConfirmDialog,
  handleConfirmedClose
}) {
  return (
    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog} className="fixed" style={{ zIndex: 200 }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn rời đi?</AlertDialogTitle>
          <AlertDialogDescription >
            Nếu rời đi bây giờ, các thay đổi của bạn sẽ không được lưu.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Ở lại</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmedClose}>Đồng ý</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}